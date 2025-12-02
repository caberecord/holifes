// lib/payments/encryption.ts
import { KeyManagementServiceClient } from '@google-cloud/kms';

// Cliente KMS (instanciado solo si es necesario)
const client = new KeyManagementServiceClient();

// Variables de entorno requeridas para KMS
const projectId = process.env.GOOGLE_PROJECT_ID;
const locationId = process.env.GOOGLE_LOCATION_ID;
const keyRingId = process.env.GOOGLE_KMS_KEY_RING_ID;
const keyId = process.env.GOOGLE_KMS_KEY_ID;

// Verificar si KMS está configurado
const isKmsConfigured = projectId && locationId && keyRingId && keyId;

// Nombre del recurso de la clave
const keyName = isKmsConfigured ? client.cryptoKeyPath(
    projectId!,
    locationId!,
    keyRingId!,
    keyId!
) : '';

export async function encrypt(plaintext: string): Promise<string> {
    if (isKmsConfigured) {
        try {
            const [result] = await client.encrypt({
                name: keyName,
                plaintext: Buffer.from(plaintext),
            });
            return result.ciphertext!.toString('base64');
        } catch (error) {
            console.error('Error encrypting with KMS:', error);
            throw new Error('Encryption failed');
        }
    }

    // Fallback: Simulación para desarrollo (Base64 simple)
    // ADVERTENCIA: No usar en producción sin variables de entorno KMS
    if (process.env.NODE_ENV === 'production') {
        console.warn('WARNING: Running in production without KMS configured. Using insecure fallback.');
    }

    if (!plaintext) return '';
    const buffer = Buffer.from(plaintext);
    return buffer.toString('base64');
}

export async function decrypt(cipherText: string): Promise<string> {
    if (isKmsConfigured) {
        try {
            const [result] = await client.decrypt({
                name: keyName,
                ciphertext: Buffer.from(cipherText, 'base64'),
            });
            return result.plaintext!.toString();
        } catch (error) {
            console.error('Error decrypting with KMS:', error);
            throw new Error('Decryption failed');
        }
    }

    // Fallback: Simulación para desarrollo
    if (!cipherText) return '';
    const buffer = Buffer.from(cipherText, 'base64');
    return buffer.toString('utf-8');
}
