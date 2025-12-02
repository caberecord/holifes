// lib/payments/nequi/types.ts

// Estructura Base del Header Nequi [cite: 207]
export interface NequiHeader {
    Channel: string;          // Ej: 'PNP04-C001'
    MessageID: string;        // UUID único por transacción
    ClientID: string;         // Identificador de tu app
    Destination: {
        ServiceName: string;    // Ej: 'PaymentsService'
        ServiceOperation: string; // Ej: 'unregisteredPayment'
        ServiceRegion: string;  // Ej: 'C001'
        ServiceVersion: string; // Ej: '1.2.0'
    };
    ResponseDate?: string;
    Status?: {
        StatusCode: string;
        StatusDesc: string;
    };
}

// Estructura Genérica del Request/Response [cite: 207]
export interface NequiEnvelope<T> {
    ResponseMessage: {
        ResponseHeader: NequiHeader;
        ResponseBody: {
            any: T;
        };
    };
}

// Payload para Crear Pago (UnregisteredPayment)
export interface CreatePaymentRequest {
    unregisteredPaymentRQ: {
        phoneNumber: string;
        code: string;       // Código de país, ej: "57"
        value: string;      // Monto sin decimales ni separadores
        reference1: string; // Tu ID de orden interno
        reference2?: string;
        reference3?: string;
    };
}

// Respuesta de Creación [cite: 207]
export interface CreatePaymentResponse {
    unregisteredPaymentRS: {
        transactionId: string; // Guardar esto para consultar estado
    };
}

// Respuesta de Consulta de Estado [cite: 301]
export interface StatusPaymentResponse {
    getStatusPaymentRS: {
        status: string; // "33"=Pendiente, "35"=Exitoso, "36"=Cancelado
        date: string;
        value: string;
        originMoney?: Array<{
            name: string;
            value: string;
        }>;
    };
}
