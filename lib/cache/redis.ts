import { Redis } from '@upstash/redis';

/**
 * Cliente Redis para cacheo de subdominios
 * Utiliza Upstash Redis (serverless, compatible con Vercel Edge)
 * 
 * Configuración requerida en .env:
 * UPSTASH_REDIS_REST_URL=https://...
 * UPSTASH_REDIS_REST_TOKEN=...
 */

// Inicializar cliente Redis
const redis = process.env.UPSTASH_REDIS_REST_URL
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null;

// Prefijo para keys de subdominios
const SUBDOMAIN_PREFIX = 'subdomain:';
const SUBDOMAIN_TTL = 3600; // 1 hora en segundos

/**
 * Obtener información del evento desde caché por subdominio
 * @param subdomain El subdominio a buscar (ej. "concierto2025")
 * @returns Event ID si existe, null si no está en caché
 */
export async function getSubdomainFromCache(subdomain: string): Promise<string | null> {
    if (!redis) {
        console.warn('[Redis] Client not initialized. Skipping cache.');
        return null;
    }

    try {
        const key = `${SUBDOMAIN_PREFIX}${subdomain}`;
        const eventId = await redis.get<string>(key);

        if (eventId) {
            // console.log(`[Redis] Cache HIT for subdomain: ${subdomain} → Event ID: ${eventId}`);
        } else {
            // console.log(`[Redis] Cache MISS for subdomain: ${subdomain}`);
        }

        return eventId;
    } catch (error) {
        console.error(`[Redis] Error fetching subdomain ${subdomain}:`, error);
        return null;
    }
}

/**
 * Guardar mapeo subdomain → eventId en caché
 * @param subdomain El subdominio (ej. "concierto2025")
 * @param eventId El ID del evento en Firestore
 */
export async function setSubdomainCache(subdomain: string, eventId: string): Promise<void> {
    if (!redis) {
        console.warn('[Redis] Client not initialized. Skipping cache set.');
        return;
    }

    try {
        const key = `${SUBDOMAIN_PREFIX}${subdomain}`;
        await redis.setex(key, SUBDOMAIN_TTL, eventId);
        // console.log(`[Redis] Cached subdomain: ${subdomain} → Event ID: ${eventId} (TTL: ${SUBDOMAIN_TTL}s)`);
    } catch (error) {
        console.error(`[Redis] Error caching subdomain ${subdomain}:`, error);
    }
}

/**
 * Invalidar caché de un subdominio
 * Útil cuando se edita o elimina un evento
 * @param subdomain El subdominio a invalidar
 */
export async function invalidateSubdomainCache(subdomain: string): Promise<void> {
    if (!redis) {
        console.warn('[Redis] Client not initialized. Skipping cache invalidation.');
        return;
    }

    try {
        const key = `${SUBDOMAIN_PREFIX}${subdomain}`;
        await redis.del(key);
        // console.log(`[Redis] Invalidated subdomain cache: ${subdomain}`);
    } catch (error) {
        console.error(`[Redis] Error invalidating subdomain ${subdomain}:`, error);
    }
}

/**
 * Verificar si Redis está disponible
 */
export function isRedisAvailable(): boolean {
    return redis !== null;
}
