import { Event } from "@/types/event";

export interface POSCartItem {
    zoneName: string;
    quantity: number;
    price: number;
}

export interface POSAttendee {
    name: string;
    email: string;
    phone: string;
    idNumber: string;
    idType: 'CC' | 'CE' | 'TI' | 'PASSPORT' | 'NIT';
}

export interface POSSaleData {
    event: Event;
    cart: { [key: string]: number };
    total: number;
    date: string;
    attendees: any[]; // Ideally strict typed too, but depends on Firestore structure
    paymentMethod: 'card' | 'cash' | 'transfer' | 'other';
    cashReceived: string;
    change: number;
    contactId?: string;
}

export interface POSState {
    cart: { [key: string]: number };
    mainAttendee: POSAttendee;
    paymentMethod: string | null;
    cashReceived: string;
    isProcessing: boolean;
    lastSaleData: POSSaleData | null;
    isSearchingContact: boolean;
}
