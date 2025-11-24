// Ticket validation utilities for check-in

import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { verifyTicketSignature, parseSecureTicketId, parseQRPayload, verifyQRPayload } from '../ticketSecurity';
import { ValidationResult } from '../../types/user';
import { logScanAttempt } from '../audit/scanLogger';

/**
 * Validate a scanned ticket and perform check-in
 */
export async function validateAndCheckIn(
    qrContent: string,
    eventId: string,
    staffUid: string,
    staffName: string = 'Staff'
): Promise<ValidationResult> {
    try {
        // 1. Parse QR Content (JSON or Legacy)
        const parsedQR = parseQRPayload(qrContent);

        if (!parsedQR) {
            await logScanAttempt({
                ticketId: 'unknown',
                eventId,
                scannerId: staffUid,
                scannerName: staffName,
                result: 'format_error',
                failureReason: 'QR inválido o corrupto',
                metadata: { isLegacyQR: false }
            });

            return {
                status: 'INVALID',
                message: 'Formato de QR inválido o corrupto',
            };
        }

        let ticketIdToFind: string;
        let isLegacy = false;

        // Handle based on format
        if ('legacy' in parsedQR) {
            // Legacy format: "POS-ABC123-SIGNATURE"
            isLegacy = true;
            ticketIdToFind = parsedQR.ticketId;

            // Basic format check for legacy
            const parts = ticketIdToFind.split('-');
            if (parts.length < 4) {
                await logScanAttempt({
                    ticketId: ticketIdToFind,
                    eventId,
                    scannerId: staffUid,
                    scannerName: staffName,
                    result: 'format_error',
                    failureReason: 'Formato legacy inválido',
                    metadata: { isLegacyQR: true }
                });

                return {
                    status: 'INVALID',
                    message: 'Formato de ticket inválido (Legacy)',
                };
            }
        } else {
            // New JSON format
            // Verify Event ID matches immediately
            if (parsedQR.eId !== eventId) {
                await logScanAttempt({
                    ticketId: parsedQR.tId,
                    eventId,
                    scannerId: staffUid,
                    scannerName: staffName,
                    result: 'wrong_event',
                    failureReason: `Ticket para evento ${parsedQR.eId}`,
                    metadata: { isLegacyQR: false }
                });

                return {
                    status: 'INVALID',
                    message: 'Este ticket pertenece a otro evento',
                };
            }

            // Reconstruct the full ticket ID for lookup (baseId + signature)
            ticketIdToFind = `${parsedQR.tId}-${parsedQR.s}`;
        }

        // 2. Query Firestore for this ticket
        const eventsRef = collection(db, 'events');
        const eventDoc = await getDocs(query(eventsRef, where('__name__', '==', eventId)));

        if (eventDoc.empty) {
            await logScanAttempt({
                ticketId: ticketIdToFind,
                eventId,
                scannerId: staffUid,
                scannerName: staffName,
                result: 'wrong_event',
                failureReason: 'Evento no existe en BD',
                metadata: { isLegacyQR: isLegacy }
            });

            return {
                status: 'INVALID',
                message: 'Evento no encontrado',
            };
        }

        const eventData = eventDoc.docs[0].data();
        const attendees = eventData.distribution?.uploadedGuests || [];

        // Find attendee with this ticket ID
        const attendeeIndex = attendees.findIndex((a: any) => a.ticketId === ticketIdToFind);

        if (attendeeIndex === -1) {
            await logScanAttempt({
                ticketId: ticketIdToFind,
                eventId,
                scannerId: staffUid,
                scannerName: staffName,
                result: 'ticket_not_found',
                failureReason: 'Ticket no está en lista de invitados',
                metadata: { isLegacyQR: isLegacy }
            });

            return {
                status: 'INVALID',
                message: 'Ticket no encontrado en la lista de invitados',
            };
        }

        const attendee = attendees[attendeeIndex];

        // 3. Verify HMAC signature
        let isValidSignature = false;

        if (isLegacy) {
            const { baseId, signature } = parseSecureTicketId(ticketIdToFind);
            isValidSignature = await verifyTicketSignature(
                {
                    ticketId: baseId,
                    email: attendee.Email,
                    eventId,
                },
                signature
            );
        } else {
            // Verify JSON payload signature
            isValidSignature = await verifyQRPayload(parsedQR as any, attendee.Email);
        }

        if (!isValidSignature) {
            await logScanAttempt({
                ticketId: ticketIdToFind,
                eventId,
                scannerId: staffUid,
                scannerName: staffName,
                result: 'invalid_signature',
                failureReason: 'Firma digital no coincide',
                metadata: { isLegacyQR: isLegacy }
            });

            return {
                status: 'INVALID',
                message: 'Ticket falsificado - firma inválida',
            };
        }

        // 4. Check if already checked in
        if (attendee.checkedIn) {
            await logScanAttempt({
                ticketId: ticketIdToFind,
                eventId,
                scannerId: staffUid,
                scannerName: staffName,
                result: 'duplicate_attempt',
                previousCheckIn: {
                    timestamp: attendee.checkInTime,
                    scannerId: attendee.checkInBy || 'unknown'
                },
                metadata: { isLegacyQR: isLegacy }
            });

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

        // Log success
        await logScanAttempt({
            ticketId: ticketIdToFind,
            eventId,
            scannerId: staffUid,
            scannerName: staffName,
            result: isLegacy ? 'legacy_success' : 'success',
            metadata: { isLegacyQR: isLegacy }
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
            message: 'Error interno al validar ticket',
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
