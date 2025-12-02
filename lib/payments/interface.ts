// lib/payments/interface.ts
import { CreateCheckoutParams, CheckoutResponse, DecryptedCredentials } from './types';

export interface PaymentProvider {
    providerId: string;

    /**
     * Genera la URL para que el organizador vincule su cuenta (OAuth).
     * @param state Token anti-CSRF y metadata del tenant[cite: 74].
     * @param redirectUri URL de retorno configurada en tu app.
     */
    getOnboardingUrl(state: string, redirectUri: string): Promise<string>;

    /**
     * Intercambia el código temporal por credenciales permanentes.
     * Debe devolver las credenciales listas para ser cifradas.
     */
    authorizeTenant(authorizationCode: string): Promise<DecryptedCredentials>;

    /**
     * Genera una sesión de pago (Split Payment).
     * Aquí ocurre la magia de separar tu comisión del dinero del cliente[cite: 89, 125].
     */
    createCheckoutSession(
        params: CreateCheckoutParams,
        credentials: DecryptedCredentials
    ): Promise<CheckoutResponse>;

    /**
     * (Opcional) Verifica si el token está vencido y lo renueva.
     * Crítico para Mercado Pago[cite: 114, 115].
     */
    refreshTokenIfNeeded?(currentCredentials: DecryptedCredentials): Promise<DecryptedCredentials | null>;
}
