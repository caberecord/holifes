// lib/payments/types.ts

// Identificadores de las pasarelas soportadas
export type PaymentProviderId = 'stripe' | 'mercadopago_co' | 'mercadopago_mx' | 'paypal' | 'nequi';

// Estructura de las credenciales desencriptadas (lo que necesita el adaptador para funcionar)
export interface DecryptedCredentials {
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string; // Para PayPal o flujos manuales
    accountId?: string;    // Stripe Connect ID o MP User ID
    expiresAt?: number;    // Para control de renovación de tokens MP [cite: 114]
}

// Parámetros para iniciar un cobro
export interface CreateCheckoutParams {
    tenantId: string;        // ID de la empresa organizadora
    orderId: string;         // Tu ID interno de orden
    amount: number;          // Monto total (ej: 10000)
    currency: string;        // 'COP', 'USD', 'MXN'
    description: string;
    payerEmail?: string;

    // Split Payments: La parte crítica para tu modelo de negocio [cite: 7]
    applicationFee: number;  // Tu comisión como plataforma
    connectedAccountId: string; // ID de la cuenta del organizador (destino de fondos)
    providerMetadata?: any;  // Datos extra específicos del proveedor (ej. celular para Nequi)
}

// Respuesta estandarizada para el frontend
export interface CheckoutResponse {
    checkoutUrl: string;     // URL a donde redirigir al usuario (Stripe Hosted o MP Pro)
    sessionId: string;       // ID de sesión de la pasarela
    providerMetadata?: any;  // Datos extra si se requieren
}
