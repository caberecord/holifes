// lib/payments/factory.ts
import { adminDb as db } from '@/lib/firebaseAdmin'; // Tu instancia de admin
import { decrypt } from './encryption'; // Función helper KMS
import { StripeProvider } from './adapters/stripe';
import { MercadoPagoProvider } from './adapters/mercadopago';
import { NequiProvider } from './adapters/nequi';
import { PaymentProvider } from './interface';
import { PaymentProviderId } from './types';

// Mapa de clases disponibles
const adapters: Record<string, new () => PaymentProvider> = {
    'stripe': StripeProvider,
    'mercadopago_co': MercadoPagoProvider,
    'mercadopago_mx': MercadoPagoProvider,
    'nequi': NequiProvider,
    // 'paypal': PayPalProvider (Pendiente fase BYOK [cite: 167])
};

export async function getPaymentProvider(tenantId: string): Promise<PaymentProvider> {
    // 1. Buscar configuración pública del tenant para saber qué pasarela usa
    // [cite: 29] Separación de config pública vs privada
    const publicConfigSnap = await db.doc(`tenants/${tenantId}/config/public`).get();
    const publicData = publicConfigSnap.data();

    if (!publicData || !publicData.activeProvider) {
        throw new Error(`El tenant ${tenantId} no tiene pasarela configurada.`);
    }

    const providerId = publicData.activeProvider as PaymentProviderId;
    const AdapterClass = adapters[providerId];

    if (!AdapterClass) {
        throw new Error(`Proveedor ${providerId} no implementado.`);
    }

    const provider = new AdapterClass();

    // NOTA: Para métodos como 'createCheckoutSession', el factory podría
    // encargarse aquí mismo de buscar y desencriptar las credenciales
    // para inyectarlas, manteniendo esa lógica centralizada y segura.

    return provider;
}

/**
* Función helper para obtener credenciales listas para usar (Decrypted).
* Implementa el patrón "Just-in-Time decryption"[cite: 40].
*/
export async function getTenantCredentials(tenantId: string) {
    // Acceso restringido solo via Admin SDK [cite: 31]
    const secretsSnap = await db.doc(`tenants/${tenantId}/config/secrets`).get();
    const encryptedData = secretsSnap.data();

    if (!encryptedData) throw new Error('Credenciales no encontradas');

    // Descifrar usando KMS antes de devolver
    // El token plano nunca tocó el disco [cite: 41]
    const credentials = await decrypt(encryptedData.cipherText);

    return JSON.parse(credentials);
}
