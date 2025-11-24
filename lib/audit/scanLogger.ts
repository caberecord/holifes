import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { ScanLog, ScanResult } from '../../types/audit';

/**
 * Log a ticket scan attempt to Firestore for audit trail
 */
export async function logScanAttempt(
    logData: Omit<ScanLog, 'id' | 'timestamp'>
): Promise<string> {
    try {
        const logsRef = collection(db, 'scan_logs');

        const docRef = await addDoc(logsRef, {
            ...logData,
            timestamp: serverTimestamp(), // Use server timestamp for accuracy
        });

        return docRef.id;
    } catch (error) {
        // Logging should not block the user flow, but we should record the error
        console.error('Failed to log scan attempt:', error);
        return '';
    }
}
