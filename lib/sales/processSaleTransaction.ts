import { db } from "@/lib/firebase";
import { runTransaction, doc } from "firebase/firestore";
import { Event } from "@/types/event";

export const processSaleTransaction = async (
    eventId: string,
    zoneName: string,
    newAttendees: any[]
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
            const currentSold = eventData.distribution?.uploadedGuests?.filter(
                g => g.Zone === zoneName && g.Status !== 'Anulado'
            ).length || 0;

            const newTotal = currentSold + newAttendees.length;

            if (newTotal > zone.capacity) {
                throw new Error(`Sold Out: Solo quedan ${zone.capacity - currentSold} entradas en esta zona.`);
            }

            // Prepare the update
            // We need to append new attendees to the existing array
            // Note: arrayUnion is not available inside transaction.update in the same way for complex objects if we want to be strict,
            // but we can just read the array and write it back since we are in a transaction.

            const currentGuests = eventData.distribution?.uploadedGuests || [];
            const updatedGuests = [...currentGuests, ...newAttendees];

            transaction.update(eventRef, {
                "distribution.uploadedGuests": updatedGuests
            });
        });

        return { success: true };

    } catch (error: any) {
        console.error("Transaction failed: ", error);
        throw error; // Re-throw to be handled by the caller
    }
};
