// Ticket validation utilities for check-in

import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { verifyTicketSignature, parseSecureTicketId } from '../ticketSecurity';
import { ValidationResult } from '../../types/user';

/**
 * Validate a scanned ticket and perform check-in
 */
export async function validateAndCheckIn(
    ticketId: string,
    eventId: string,
    staffUid: string
): Promise<ValidationResult> {
    try {
        // 1. Verify ticket format
        const parts = ticketId.split('-');
        if (parts.length < 4) {
            return {
                status: 'INVALID',
                message: 'Formato de ticket inválido',
            };
        }

        // 2. Query Firestore for this ticket
        const eventsRef = collection(db, 'events');
        const eventDoc = await getDocs(query(eventsRef, where('__name__', '==', eventId)));

        if (eventDoc.empty) {
            return {
                status: 'INVALID',
                message: 'Evento no encontrado',
            };
        }

        const eventData = eventDoc.docs[0].data();
        const attendees = eventData.distribution?.uploadedGuests || [];

        // Find attendee with this ticket ID
        const attendeeIndex = attendees.findIndex((a: any) => a.ticketId === ticketId);

        if (attendeeIndex === -1) {
            return {
                status: 'INVALID',
                message: 'Ticket no encontrado en este evento',
            };
        }

        const attendee = attendees[attendeeIndex];

        // 3. Verify HMAC signature
        const { baseId, signature } = parseSecureTicketId(ticketId);

        const isValid = await verifyTicketSignature(
            {
                ticketId: baseId,
                email: attendee.Email,
                eventId,
            },
            signature
        );

        if (!isValid) {
            return {
                status: 'INVALID',
                message: 'Ticket falsificado - firma inválida',
            };
        }

        // 4. Check if already checked in
        if (attendee.checkedIn) {
            return {
                status: 'ALREADY_CHECKED_IN',
                message: `Ya registrado el ${new Date(attendee.checkInTime).toLocaleString('es-ES')}`,
                attendee,
                checkInInfo: {
                    checkedIn: true,
                    checkInTime: attendee.checkInTime,
                    checkInBy: attendee.checkInBy,
                },
            };
        }

        // 5. Mark as checked in
        attendees[attendeeIndex] = {
            ...attendee,
            checkedIn: true,
            checkInTime: new Date(),
            checkInBy: staffUid,
        };

        // Update Firestore
        const eventDocRef = doc(db, 'events', eventId);
        await updateDoc(eventDocRef, {
            'distribution.uploadedGuests': attendees,
        });

        return {
            status: 'VALID',
            message: '¡Check-in exitoso!',
            attendee: attendees[attendeeIndex],
            checkInInfo: {
                checkedIn: true,
                checkInTime: attendees[attendeeIndex].checkInTime,
                checkInBy: staffUid,
            },
        };
    } catch (error) {
        console.error('Validation error:', error);
        return {
            status: 'INVALID',
            message: 'Error al validar ticket',
        };
    }
}

/**
 * Get attendance statistics for an event
 */
export async function getAttendanceStats(eventId: string) {
    try {
        const eventDoc = await getDocs(query(collection(db, 'events'), where('__name__', '==', eventId)));

        if (eventDoc.empty) {
            return {
                checkedIn: 0,
                total: 0,
                percentage: 0,
            };
        }

        const eventData = eventDoc.docs[0].data();
        const attendees = eventData.distribution?.uploadedGuests || [];
        const checkedInCount = attendees.filter((a: any) => a.checkedIn).length;
        const total = attendees.length;
        const percentage = total > 0 ? Math.round((checkedInCount / total) * 100) : 0;

        return {
            checkedIn: checkedInCount,
            total,
            percentage,
        };
    } catch (error) {
        console.error('Error getting attendance stats:', error);
        return {
            checkedIn: 0,
            total: 0,
            percentage: 0,
        };
    }
}
