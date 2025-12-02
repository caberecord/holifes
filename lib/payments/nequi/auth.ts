// lib/payments/nequi/auth.ts
import axios from 'axios';

interface NequiAuthConfig {
    clientId: string;
    clientSecret: string;
    authUrl: string;
}

// Cache simple en memoria: clientId -> { token, expiry }
const tokenCache: Record<string, { token: string; expiry: number }> = {};

export async function getNequiToken(config: NequiAuthConfig): Promise<string> {
    const now = Date.now();
    const cacheKey = config.clientId;
    const cached = tokenCache[cacheKey];

    // Retornar caché si es válido (con margen de 2 minutos)
    if (cached && now < cached.expiry - 120000) {
        return cached.token;
    }

    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

    try {
        const response = await axios.post(
            config.authUrl,
            'grant_type=client_credentials', // x-www-form-urlencoded [cite: 464]
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                }
            }
        );

        const { access_token, expires_in } = response.data;

        tokenCache[cacheKey] = {
            token: access_token,
            expiry: now + (parseInt(expires_in) * 1000)
        };

        return access_token;
    } catch (error) {
        console.error('Error obteniendo token Nequi:', error);
        throw new Error('Fallo autenticación Nequi');
    }
}
