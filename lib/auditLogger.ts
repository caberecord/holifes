import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type AuditAction =
    | 'UPDATE_EVENT_DETAILS'
    | 'UPDATE_VENUE_MAP'
    | 'UPDATE_DISTRIBUTION'
    | 'UPDATE_PLAN'
    | 'UPLOAD_COVER_IMAGE';

export const logEventAction = async (
    eventId: string,
    action: AuditAction,
    userId: string,
    details?: any
) => {
    try {
        await addDoc(collection(db, "audit_logs"), {
            eventId,
            action,
            userId,
            details,
            timestamp: serverTimestamp(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        });
        console.log(`[Audit] Logged action: ${action} for event ${eventId}`);
    } catch (error) {
        console.error("Error logging audit action:", error);
        // We don't throw here to avoid blocking the main action
    }
};
