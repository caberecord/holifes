import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";

export type TransactionType = 'SALE' | 'INVOICE_EMISSION' | 'PAYMENT_REGISTRATION' | 'CREDIT_NOTE' | 'REFUND';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export interface TransactionLog {
    organizerId: string;
    eventId: string;
    orderId: string;
    userId?: string; // Staff or User who triggered the action
    contactId?: string; // Link to Contacts Module
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: string;
    alegraId?: string; // ID of invoice/payment/note in Alegra
    metadata: {
        description: string;
        providerResponse?: any; // Raw response from Alegra/Stripe for debug
        error?: string;
        [key: string]: any;
    };
    createdAt: any; // ServerTimestamp
}

export const logTransaction = async (data: Omit<TransactionLog, 'createdAt'>) => {
    try {
        await addDoc(collection(db, "transactions"), {
            ...data,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error logging transaction:", error);
        // We don't throw here to avoid breaking the main flow if logging fails
    }
};
