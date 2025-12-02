// lib/payments/adapters/mercadopago.ts
import { PaymentProvider } from '../interface';
import { CreateCheckoutParams, CheckoutResponse, DecryptedCredentials } from '../types';

export class MercadoPagoProvider implements PaymentProvider {
    providerId = 'mercadopago';

    async getOnboardingUrl(state: string, redirectUri: string): Promise<string> {
        // TODO: Implementar lógica real de MP
        return `https://auth.mercadopago.com.co/authorization?client_id=${process.env.MP_CLIENT_ID}&response_type=code&platform_id=mp&state=${state}&redirect_uri=${redirectUri}`;
    }

    async authorizeTenant(authorizationCode: string): Promise<DecryptedCredentials> {
        // TODO: Implementar intercambio de token MP
        return {
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            expiresAt: Date.now() + 1000 * 60 * 60 * 6 // 6 horas
        };
    }

    async createCheckoutSession(
        params: CreateCheckoutParams,
        credentials: DecryptedCredentials
    ): Promise<CheckoutResponse> {
        // TODO: Implementar creación de preferencia MP
        return {
            checkoutUrl: 'https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=mock',
            sessionId: 'mock_session_id'
        };
    }

    async refreshTokenIfNeeded(currentCredentials: DecryptedCredentials): Promise<DecryptedCredentials | null> {
        // TODO: Implementar refresh token
        return currentCredentials;
    }
}
