import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { ScanLog } from '../../types/audit';

/**
 * Fetch scan logs for a specific event
 * @param eventId The ID of the event to fetch logs for
 * @param limitCount Optional limit on number of logs to fetch (default 100)
 */
export async function getEventScanLogs(eventId: string, limitCount = 100): Promise<ScanLog[]> {
    try {
        const logsRef = collection(db, 'scan_logs');
        const q = query(
            logsRef,
            where('eventId', '==', eventId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ScanLog));
    } catch (error) {
        console.error('Error fetching scan logs:', error);
        return [];
    }
}
