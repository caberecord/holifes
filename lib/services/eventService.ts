import { adminDb } from '../../lib/firebaseAdmin';
import { Event } from '../../types/event';

export async function getEventBySubdomain(subdomain: string): Promise<Event | null> {
    try {
        const eventsRef = adminDb.collection('events');
        const snapshot = await eventsRef.where('subdomain', '==', subdomain).limit(1).get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const eventData = doc.data();

        return {
            id: doc.id,
            ...eventData,
            // Asegurar que las fechas sean strings ISO si vienen como Timestamps
            startDate: eventData.startDate?.toDate?.()?.toISOString() || eventData.startDate,
            endDate: eventData.endDate?.toDate?.()?.toISOString() || eventData.endDate,
            createdAt: eventData.createdAt?.toDate?.()?.toISOString() || eventData.createdAt,
            updatedAt: eventData.updatedAt?.toDate?.()?.toISOString() || eventData.updatedAt,
        } as unknown as Event;
    } catch (error) {
        console.error('Error fetching event by subdomain:', error);
        return null;
    }
}
