import { db } from "@/lib/firebase";
import { runTransaction, doc, collection, increment, serverTimestamp } from "firebase/firestore";
import { Event } from "@/types/event";

export const processSaleTransaction = async (
    eventId: string,
    zoneName: string,
    newAttendees: any[],
    totalAmount?: number
) => {
    const eventRef = doc(db, "events", eventId);

    try {
        await runTransaction(db, async (transaction) => {
            const eventDoc = await transaction.get(eventRef);
            if (!eventDoc.exists()) {
                throw new Error("El evento no existe");
            }

            const eventData = eventDoc.data() as Event;
            const zone = eventData.venue?.zones.find(z => z.name === zoneName);

            if (!zone) {
                throw new Error("La zona seleccionada no existe");
            }

            // Calculate current sold tickets for this zone
            let currentSold = 0;
            if (eventData.stats?.soldByZone?.[zoneName] !== undefined) {
                currentSold = eventData.stats.soldByZone[zoneName];
            } else if (eventData.distribution?.uploadedGuests) {
                currentSold = eventData.distribution.uploadedGuests.filter(
                    g => g.Zone === zoneName && g.Status !== 'Anulado' && g.Status !== 'deleted'
                ).length;
            }

            const newTotal = currentSold + newAttendees.length;

            if (newTotal > zone.capacity) {
                throw new Error(`Sold Out: Solo quedan ${zone.capacity - currentSold} entradas en esta zona.`);
            }

            // Price Validation (Security)
            const expectedTotal = zone.price * newAttendees.length;

            if (totalAmount !== undefined && totalAmount !== expectedTotal) {
                throw new Error(`Price mismatch: Expected ${expectedTotal}, got ${totalAmount}`);
            }

            // 1. Write to Subcollection 'attendees'
            newAttendees.forEach(attendee => {
                const attendeeRef = doc(collection(eventRef, "attendees"), attendee.ticketId);
                transaction.set(attendeeRef, {
                    ...attendee,
                    organizerId: eventData.organizerId,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            });

            // 2. Update Event Stats (Atomic Increments)
            const updateData: any = {
                [`stats.soldByZone.${zoneName}`]: increment(newAttendees.length),
                "stats.totalSold": increment(newAttendees.length),
                "stats.attendeesCount": increment(newAttendees.length),
            };

            // Revenue Tracking
            if (totalAmount !== undefined) {
                updateData["stats.revenue"] = increment(totalAmount);
            }

            transaction.update(eventRef, updateData);
        });

        return { success: true, transactionId: `TX-${Date.now()}`, tickets: newAttendees };

    } catch (error: any) {
        console.error("Transaction failed: ", error);
        return { success: false, error: error.message };
    }
};
