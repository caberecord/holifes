// Ticket validation utilities for check-in

import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { verifyTicketSignature, parseSecureTicketId, parseQRPayload, verifyQRPayload } from '../ticketSecurity';
import { ValidationResult } from '../../types/user';

/**
 * Validate a scanned ticket and perform check-in
 */
export async function validateAndCheckIn(
    qrContent: string,
    providedEventId: string,
    staffUid: string
): Promise<ValidationResult> {
    try {
        // 1. Parse QR content (JSON or legacy format)
        const parsed = parseQRPayload(qrContent);

        if (!parsed) {
            return {
                status: 'INVALID',
                message: 'Código QR inválido',
            };
        }

        let eventId: string;
        let ticketIdToSearch: string;
        let attendeeEmail: string | undefined;

        // Handle JSON format (new secure format)
        if ('tId' in parsed) {
            // JSON QR payload
            eventId = parsed.eId;
            ticketIdToSearch = parsed.tId;

            // Verify eventId matches (security check)
            if (eventId !== providedEventId) {
                return {
                    status: 'INVALID',
                    message: 'Este ticket pertenece a otro evento',
                };
            }

            // We'll verify signature after fetching attendee (need email)
        } else {
            // Legacy format
            eventId = providedEventId;
            ticketIdToSearch = parsed.ticketId;
        }

        // 2. Query Firestore for event
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

        // 3. Find attendee - search by full ticketId OR base ticketId
        let attendeeIndex = -1;

        if ('tId' in parsed) {
            // JSON format: search by base ticketId (without signature)
            attendeeIndex = attendees.findIndex((a: any) => {
                if (a.ticketId) {
                    // Extract base ID from stored ticketId (format: BASE-SIGNATURE)
                    try {
                        const { baseId } = parseSecureTicketId(a.ticketId);
                        return baseId === ticketIdToSearch;
                    } catch {
                        return false;
                    }
                }
                return false;
            });
        } else {
            // Legacy format: search by full ticketId
            attendeeIndex = attendees.findIndex((a: any) => a.ticketId === ticketIdToSearch);
        }

        if (attendeeIndex === -1) {
            return {
                status: 'INVALID',
                message: 'Ticket no encontrado en este evento',
            };
        }

        const attendee = attendees[attendeeIndex];
        attendeeEmail = attendee.Email;

        // Ensure email exists
        if (!attendeeEmail) {
            return {
                status: 'INVALID',
                message: 'Ticket sin email asociado',
            };
        }

        // 4. Verify signature
        let isSignatureValid = false;

        if ('tId' in parsed) {
            // JSON format: verify QR payload signature
            isSignatureValid = await verifyQRPayload(parsed, attendeeEmail);
        } else {
            // Legacy format: verify ticketId signature
            try {
                const { baseId, signature } = parseSecureTicketId(ticketIdToSearch);
                isSignatureValid = await verifyTicketSignature(
                    {
                        ticketId: baseId,
                        email: attendeeEmail,
                        eventId,
                    },
                    signature
                );
            } catch {
                isSignatureValid = false;
            }
        }

        if (!isSignatureValid) {
            return {
                status: 'INVALID',
                message: 'Ticket falsificado - firma inválida',
            };
        }

        // 5. Check if already checked in
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

        // 6. Mark as checked in
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
