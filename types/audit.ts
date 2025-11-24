import { Timestamp } from 'firebase/firestore';

export type ScanResult =
    | 'success'
    | 'duplicate_attempt'
    | 'invalid_signature'
    | 'wrong_event'
    | 'ticket_not_found'
    | 'format_error'
    | 'legacy_success';

export interface ScanLog {
    id?: string;
    ticketId: string;
    eventId: string;
    scannerId: string; // UID of staff
    scannerName?: string; // Denormalized for quick display
    timestamp: Timestamp | Date;
    result: ScanResult;
    gateId?: string; // Optional: specific entrance

    // Context for failures
    failureReason?: string;

    // Context for duplicates
    previousCheckIn?: {
        timestamp: Timestamp | Date;
        scannerId: string;
    };

    // Technical metadata
    metadata?: {
        userAgent?: string;
        ip?: string;
        appVersion?: string;
        isLegacyQR?: boolean;
        error?: string; // Error message for debugging
    };
}
