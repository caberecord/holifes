import { Timestamp } from "firebase/firestore";

export interface Contact {
    id: string; // Auto-generated
    organizerId: string; // Owner

    // Basic Info
    name: string; // Full Name
    email: string;
    phone: string;

    // Identification
    identification: {
        type: 'CC' | 'NIT' | 'CE' | 'PASSPORT';
        number: string;
    };

    // Address
    address?: {
        address: string;
        city: string;
        department?: string;
    };

    // External IDs
    alegraId?: string; // Link to Alegra Contact

    // Metadata
    createdAt: Timestamp | any;
    updatedAt: Timestamp | any;

    // Stats (Denormalized)
    totalSpent: number;
    totalTickets: number;
    lastInteraction?: Timestamp | any;
}
