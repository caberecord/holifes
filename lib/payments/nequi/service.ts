// lib/payments/nequi/service.ts
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getNequiToken } from './auth';
import { NequiEnvelope } from './types';

export interface NequiConfig {
    clientId: string;
    clientSecret: string;
    apiKey: string;
    authUrl: string;
    apiUrl: string;
}

export class NequiService {
    private config: NequiConfig;

    constructor(config?: NequiConfig) {
        // Si no se pasa config, intentar usar env vars (fallback para compatibilidad)
        this.config = config || {
            clientId: process.env.NEQUI_CLIENT_ID!,
            clientSecret: process.env.NEQUI_CLIENT_SECRET!,
            apiKey: process.env.NEQUI_API_KEY!,
            authUrl: process.env.NEQUI_AUTH_URL || 'https://oauth2.nequi.com/oauth2/token',
            apiUrl: process.env.NEQUI_API_URL || 'https://api.nequi.com'
        };
    }

    /**
     * Helper para construir el sobre JSON estándar de Nequi
     */
    private buildEnvelope<T>(serviceName: string, operation: string, body: T): NequiEnvelope<T> {
        return {
            ResponseMessage: {
                ResponseHeader: {
                    Channel: 'PNP04-C001', // Canal asignado por Nequi
                    MessageID: uuidv4(),   // ID único obligatorio
                    ClientID: this.config.clientId,
                    Destination: {
                        ServiceName: serviceName,
                        ServiceOperation: operation,
                        ServiceRegion: 'C001',
                        ServiceVersion: '1.2.0'
                    }
                },
                ResponseBody: {
                    any: body
                }
            }
        };
    }

    /**
     * Helper para realizar la petición HTTP con Retry Logic (Exponential Backoff)
     */
    private async callNequiAPI(endpoint: string, payload: any, retries = 3, backoff = 1000): Promise<any> {
        const token = await getNequiToken({
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
            authUrl: this.config.authUrl
        });

        try {
            const response = await axios.post(`${this.config.apiUrl}${endpoint}`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': this.config.apiKey
                }
            });
            return response.data;
        } catch (error: any) {
            const status = error.response?.status;
            // Reintentar solo en errores de red o servidor (502, 504)
            if (retries > 0 && (status === 502 || status === 504 || !status)) {
                console.warn(`Nequi API Error (${status}). Retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.callNequiAPI(endpoint, payload, retries - 1, backoff * 2);
            }
            throw error;
        }
    }

    /**
     * 1. ENVIAR NOTIFICACIÓN PUSH (Cobro)
     * Endpoint: /-services-paymentservice-unregisteredpayment [cite: 207]
     */
    async createPushPayment(phone: string, amount: number, orderId: string) {
        const payload = this.buildEnvelope('PaymentsService', 'unregisteredPayment', {
            unregisteredPaymentRQ: {
                phoneNumber: phone,
                code: "57", // Colombia
                value: amount.toString(), // Sin decimales [cite: 301]
                reference1: orderId,
                reference2: "Tienda SaaS",
                reference3: "Evento XYZ"
            }
        });

        const data = await this.callNequiAPI('/-services-paymentservice-unregisteredpayment', payload);

        // Validar respuesta de negocio
        const status = data.ResponseMessage.ResponseHeader.Status;
        if (status.StatusCode !== '0') {
            throw new Error(`Error Nequi: ${status.StatusDesc}`);
        }

        return data.ResponseMessage.ResponseBody.any.unregisteredPaymentRS as { transactionId: string };
    }

    /**
     * 2. CONSULTAR ESTADO (Polling)
     * Endpoint: /-services-paymentservice-getstatuspayment [cite: 301]
     */
    async checkPaymentStatus(transactionId: string) {
        const payload = this.buildEnvelope('PaymentsService', 'getStatusPayment', {
            getStatusPaymentRQ: {
                codeQR: transactionId // En pagos push, el ID viaja aquí según documentación técnica
            }
        });

        const data = await this.callNequiAPI('/-services-paymentservice-getstatuspayment', payload);
        const result = data.ResponseMessage.ResponseBody.any.getStatusPaymentRS;

        // Mapeo de estados [cite: 301] y códigos de error específicos
        const statusMap: Record<string, string> = {
            '33': 'PENDING',
            '35': 'COMPLETED', // Realizado
            '10-455': 'REJECTED', // Cancelado o Rechazado
            '10-454': 'EXPIRED',  // Caducada
            '71': 'FAILED'
        };

        const errorMap: Record<string, string> = {
            '2-CCSB000012': 'La cuenta del usuario se encuentra bloqueada',
            '2-CCSB000013': 'La cuenta del usuario se encuentra bloqueada',
            '2-CCSB000079': 'No se encontró un dato en el core financiero (Transacción no existe)',
            '3-451': 'Cliente o usuario no encontrado en base de datos',
            '3-455': 'Registro no encontrado en base de datos',
            '10-454': 'La transacción ha expirado',
            '10-455': 'La transacción ha sido cancelada o rechazada',
            '11-9L': 'El número de celular, código o ID de transacción no existen',
            '11-17L': 'Error de formato en la solicitud',
            '11-18L': 'Timeout en el componente de lógica de negocio',
            '11-37L': 'La cuenta de un usuario no existe',
            '20-05A': 'Parámetros incorrectos en la solicitud',
            '20-07A': 'Error técnico en Lambda',
            '20-08A': 'Dato no encontrado en repositorio',
            '20-09A': '¡El usuario no puede realizar esta operación!',
            '20-10A': 'El aliado no cuenta con los permisos para realizar esta operación'
        };

        const status = statusMap[result.status] || 'UNKNOWN';
        const errorMessage = errorMap[result.status] || (status === 'FAILED' || status === 'REJECTED' ? 'Error desconocido en la transacción' : null);

        return {
            status,
            rawStatus: result.status,
            amount: result.value,
            date: result.date,
            errorMessage // Return the specific error message
        };
    }

    /**
     * 3. CANCELAR PAGO
     * Endpoint: /-services-paymentservice-cancelunregisteredpayment [cite: 239]
     */
    async cancelPayment(transactionId: string) {
        const payload = this.buildEnvelope('PaymentsService', 'cancelUnregisteredPayment', {
            cancelUnregisteredPaymentRQ: {
                transactionId: transactionId
            }
        });

        return await this.callNequiAPI('/-services-paymentservice-cancelunregisteredpayment', payload);
    }

    /**
     * 4. REVERSAR PAGO
     * Endpoint: /-services-reverseservices-reversetransaction [cite: 348]
     * Útil cuando el status queda indeterminado (timeout)
     */
    async reversePayment(transactionId: string, amount: number) {
        const payload = this.buildEnvelope('ReverseServices', 'reverseTransaction', {
            reversionRQ: {
                value: amount.toString(),
                code: "57",
                messageId: transactionId // ID original
            }
        });

        return await this.callNequiAPI('/-services-reverseservices-reversetransaction', payload);
    }
}
