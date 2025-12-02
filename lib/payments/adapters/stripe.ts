// lib/payments/adapters/stripe.ts
import Stripe from 'stripe';
import { PaymentProvider } from '../interface';
import { CreateCheckoutParams, CheckoutResponse, DecryptedCredentials } from '../types';

export class StripeProvider implements PaymentProvider {
    providerId = 'stripe';
    private platformStripe: Stripe;

    constructor() {
        // Inicializar con la Secret Key de la PLATAFORMA (tu cuenta)
        this.platformStripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2024-11-20.acacia' as any, // Updated to latest or keep user's version if specific reason
        });
    }

    async getOnboardingUrl(state: string, redirectUri: string): Promise<string> {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.STRIPE_CLIENT_ID!,
            scope: 'read_write',
            redirect_uri: redirectUri,
            state: state, // [cite: 74]
        });
        return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
    }

    async authorizeTenant(code: string): Promise<DecryptedCredentials> {
        const response = await this.platformStripe.oauth.token({
            grant_type: 'authorization_code',
            code,
        });

        // En Stripe Standard, el 'stripe_user_id' es lo más importante
        return {
            accountId: response.stripe_user_id,
            accessToken: response.access_token, // Opcional en Standard
            refreshToken: response.refresh_token,
        };
    }

    async createCheckoutSession(
        params: CreateCheckoutParams,
        credentials: DecryptedCredentials
    ): Promise<CheckoutResponse> {

        // [cite: 88] Creación de sesión
        const session = await this.platformStripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: params.currency,
                    product_data: { name: params.description },
                    unit_amount: Math.round(params.amount * 100), // Centavos
                },
                quantity: 1,
            }],
            payment_intent_data: {
                // [cite: 89] Aquí cobras tu comisión
                application_fee_amount: Math.round(params.applicationFee * 100),
                // [cite: 89] Aquí diriges los fondos al tenant
                transfer_data: {
                    destination: credentials.accountId!,
                },
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${params.orderId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
        });

        return {
            checkoutUrl: session.url!,
            sessionId: session.id,
        };
    }
}
