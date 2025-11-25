import { adminDb } from '../../lib/firebaseAdmin';
import { Event } from '../../types/event';

const serializeData = (data: any): any => {
    if (!data) return data;

    if (typeof data === 'object') {
        // Handle Firestore Timestamp
        if (data.toDate && typeof data.toDate === 'function') {
            return data.toDate().toISOString();
        }
        // Handle _seconds object (raw Firestore timestamp)
        if (data._seconds !== undefined && data._nanoseconds !== undefined) {
            return new Date(data._seconds * 1000).toISOString();
        }

        // Handle Arrays
        if (Array.isArray(data)) {
            return data.map(item => serializeData(item));
        }

        // Handle Objects
        const serialized: any = {};
        for (const key in data) {
            serialized[key] = serializeData(data[key]);
        }
        return serialized;
    }

    return data;
};

export async function getEventBySubdomain(subdomain: string): Promise<Event | null> {
    try {
        const eventsRef = adminDb.collection('events');
        const snapshot = await eventsRef.where('subdomain', '==', subdomain).limit(1).get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const eventData = doc.data();

        // Serialize all data to ensure no Timestamps remain
        const serializedEvent = serializeData({
            id: doc.id,
            ...eventData
        });

        return serializedEvent as Event;
    } catch (error) {
        console.error('Error fetching event by subdomain:', error);
        return null;
    }
}
