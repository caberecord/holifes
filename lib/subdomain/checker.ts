import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { getSubdomainFromCache, setSubdomainCache } from '../cache/redis';

/**
 * Verifica si un subdominio existe y retorna el event ID
 * 
 * Flujo:
 * 1. Busca en caché Redis primero (rápido)
 * 2. Si no está en caché, consulta Firestore
 * 3. Guarda en caché para siguientes consultas
 * 
 * @param subdomain El subdominio a verificar
 * @returns Event ID si existe, null si no existe
 */
export async function getEventIdBySubdomain(subdomain: string): Promise<string | null> {
    // 1. Intentar desde caché
    const cachedEventId = await getSubdomainFromCache(subdomain);
    if (cachedEventId) {
        return cachedEventId;
    }

    // 2. Consultar Firestore
    try {
        const eventsRef = collection(db, 'events');
        const q = query(
            eventsRef,
            where('subdomain', '==', subdomain),
            where('status_site', '!=', 'unpublished'), // Solo eventos publicados o draft
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            // console.log(`[Subdomain] Not found: ${subdomain}`);
            return null;
        }

        const eventId = snapshot.docs[0].id;

        // 3. Guardar en caché para futuros requests
        await setSubdomainCache(subdomain, eventId);

        // console.log(`[Subdomain] Found and cached: ${subdomain} → ${eventId}`);
        return eventId;
    } catch (error) {
        console.error(`[Subdomain] Error checking subdomain ${subdomain}:`, error);
        return null;
    }
}

/**
 * Verifica si un subdominio está disponible (no existe)
 * 
 * @param subdomain El subdominio a verificar
 * @returns true si está disponible, false si ya existe
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
    const eventId = await getEventIdBySubdomain(subdomain);
    return eventId === null;
}

/**
 * Obtiene todos los datos del evento por subdominio
 * 
 * @param subdomain El subdominio
 * @returns Datos del evento o null
 */
export async function getEventBySubdomain(subdomain: string): Promise<any | null> {
    try {
        const eventsRef = collection(db, 'events');
        const q = query(
            eventsRef,
            where('subdomain', '==', subdomain),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const eventDoc = snapshot.docs[0];
        return {
            id: eventDoc.id,
            ...eventDoc.data()
        };
    } catch (error) {
        console.error(`[Subdomain] Error fetching event for subdomain ${subdomain}:`, error);
        return null;
    }
}
