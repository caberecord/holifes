// Ticket validation utilities for check-in

import { collection, getDocs, query, where, doc, updateDoc, getDoc, setDoc, increment, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { verifyTicketSignature, parseSecureTicketId, parseQRPayload, verifyQRPayload } from '../ticketSecurity';
import { ValidationResult } from '../../types/user';
import { logScanAttempt } from '../audit/scanLogger';
import { Event } from '../../types/event';

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
            isLegacy = true;
            ticketIdToFind = parsedQR.ticketId;
            const parts = ticketIdToFind.split('-');
            if (parts.length < 4) {
                return { status: 'INVALID', message: 'Formato de ticket inválido (Legacy)' };
            }
        } else {
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
                return { status: 'INVALID', message: 'Este ticket pertenece a otro evento' };
            }
            ticketIdToFind = `${parsedQR.tId}-${parsedQR.s}`;
        }

        // 2. Check Subcollection First (Fast Path)
        const attendeeRef = doc(db, 'events', eventId, 'attendees', ticketIdToFind);
        const attendeeDoc = await getDoc(attendeeRef);

        let attendee: any = null;
        let source: 'subcollection' | 'legacy' = 'subcollection';
        let eventData: Event | null = null;

        if (attendeeDoc.exists()) {
            attendee = attendeeDoc.data();
        } else {
            // 3. Fallback to Legacy Array (Slow Path)
            source = 'legacy';
            const eventRef = doc(db, 'events', eventId);
            const eventDoc = await getDoc(eventRef);

            if (!eventDoc.exists()) {
                return { status: 'INVALID', message: 'Evento no encontrado' };
            }

            eventData = eventDoc.data() as Event;
            const legacyAttendees = eventData.distribution?.uploadedGuests || [];
            attendee = legacyAttendees.find((a: any) => a.ticketId === ticketIdToFind);

            if (!attendee) {
                await logScanAttempt({
                    ticketId: ticketIdToFind,
                    eventId,
                    scannerId: staffUid,
                    scannerName: staffName,
                    result: 'ticket_not_found',
                    failureReason: 'Ticket no encontrado',
                    metadata: { isLegacyQR: isLegacy }
                });
                return { status: 'INVALID', message: 'Ticket no encontrado' };
            }
        }

        // 4. Verify Signature
        let isValidSignature = false;
        if (isLegacy) {
            const { baseId, signature } = parseSecureTicketId(ticketIdToFind);
            isValidSignature = await verifyTicketSignature(
                { ticketId: baseId, email: attendee.Email, eventId },
                signature
            );
        } else {
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
            return { status: 'INVALID', message: 'Ticket falsificado - firma inválida' };
        }

        // 5. Check Check-in Status
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
                message: `Ya registrado el ${new Date(attendee.checkInTime?.toDate ? attendee.checkInTime.toDate() : attendee.checkInTime).toLocaleString('es-ES')}`,
                attendee,
                checkInInfo: {
                    checkedIn: true,
                    checkInTime: attendee.checkInTime,
                    checkInBy: attendee.checkInBy,
                },
            };
        }

        // 6. Perform Check-in (Atomic Update)
        const checkInTime = new Date();

        if (source === 'subcollection') {
            // Simple update to subcollection
            await updateDoc(attendeeRef, {
                checkedIn: true,
                checkInTime: serverTimestamp(),
                checkInBy: staffUid,
                Status: 'Ingresado',
                updatedAt: serverTimestamp()
            });

            // Increment stats
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
                "stats.checkedInCount": increment(1)
            });

        } else {
            // Migration: Create in subcollection and mark checked in
            // We do NOT remove from legacy array to avoid race conditions/complexity, 
            // but we rely on subcollection being the source of truth for check-in status.
            await setDoc(attendeeRef, {
                ...attendee,
                organizerId: eventData?.organizerId, // Use optional chaining or assertion
                checkedIn: true,
                checkInTime: serverTimestamp(),
                checkInBy: staffUid,
                Status: 'Ingresado',
                migratedFromLegacy: true,
                updatedAt: serverTimestamp()
            });

            // Increment stats
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
                "stats.checkedInCount": increment(1)
            });
        }

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
            attendee: { ...attendee, checkedIn: true, checkInTime },
            checkInInfo: {
                checkedIn: true,
                checkInTime: checkInTime,
                checkInBy: staffUid,
            },
        };

    } catch (error) {
        console.error('Validation error:', error);
        let errorMessage = 'Error interno al validar ticket';
        if (error instanceof Error) errorMessage = `Error: ${error.message}`;
        return { status: 'INVALID', message: errorMessage };
    }
}

/**
 * Get attendance statistics for an event
 */
export async function getAttendanceStats(eventId: string) {
    try {
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await getDoc(eventRef);

        if (!eventDoc.exists()) {
            return { checkedIn: 0, total: 0, percentage: 0 };
        }

        const eventData = eventDoc.data() as Event;

        // Use stats if available
        if (eventData.stats) {
            const checkedIn = eventData.stats.checkedInCount || 0;
            const total = eventData.stats.attendeesCount || eventData.stats.totalSold || 0;
            const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
            return { checkedIn, total, percentage };
        }

        // Fallback to legacy calculation
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
        return { checkedIn: 0, total: 0, percentage: 0 };
    }
}

