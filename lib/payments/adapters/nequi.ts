// lib/payments/adapters/nequi.ts
import { PaymentProvider } from '../interface';
import { CreateCheckoutParams, CheckoutResponse, DecryptedCredentials } from '../types';
import { NequiService } from '../nequi/service';

export class NequiProvider implements PaymentProvider {
    providerId = 'nequi';
    private service: NequiService;

    constructor() {
        this.service = new NequiService();
    }

    async getOnboardingUrl(state: string, redirectUri: string): Promise<string> {
        // Nequi no tiene un flujo OAuth estándar para merchants en este modelo.
        // Generalmente se configuran las credenciales manualmente (API Key, Client ID).
        // Retornamos una URL dummy o lanzamos error si se intenta usar en flujo automático.
        return '#';
    }

    async authorizeTenant(authorizationCode: string): Promise<DecryptedCredentials> {
        // No aplica para Nequi en este modelo de integración directa.
        // Se asume que las credenciales se inyectan manualmente en la DB.
        throw new Error('Nequi no soporta onboarding automático por OAuth.');
    }

    async createCheckoutSession(
        params: CreateCheckoutParams,
        credentials: DecryptedCredentials
    ): Promise<CheckoutResponse> {

        // Validar que tengamos el número de celular
        // En el flujo actual, params.payerEmail podría usarse, o providerMetadata.
        // Asumiremos que el frontend enviará el celular en providerMetadata o en una propiedad extendida.

        const phoneNumber = (params.providerMetadata as any)?.phoneNumber;

        if (!phoneNumber) {
            throw new Error('El número de celular es requerido para pagos con Nequi.');
        }

        // Iniciar el pago Push
        const { transactionId } = await this.service.createPushPayment(
            phoneNumber,
            params.amount,
            params.orderId
        );

        // Retornar URL de espera interna
        // Esta página hará polling al estado de la transacción
        const waitingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/nequi/waiting?transactionId=${transactionId}&orderId=${params.orderId}`;

        return {
            checkoutUrl: waitingUrl,
            sessionId: transactionId,
            providerMetadata: {
                transactionId
            }
        };
    }

    // Nequi maneja tokens internamente en el servicio (client_credentials), 
    // no por tenant individual en este diseño simplificado, 
    // pero si cada tenant tuviera sus propias credenciales Nequi, 
    // aquí se podría implementar la lógica de refresh.
}
