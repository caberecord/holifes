export interface Event {
    id?: string;
    // Basic Info
    name: string; // Wizard uses name
    title?: string; // Legacy support
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    address?: string; // Specific address
    googleMapsUrl?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    category?: string;

    // Plan
    plan?: string;

    // Venue
    venue?: {
        type: string;
        totalCapacity: number;
        zones: Array<{
            id: string;
            name: string;
            capacity: number;
            price: number;
            color: string;
            type?: 'standing' | 'seating';
            shape?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            rotation?: number;
        }>;
        venueMap?: any; // Full JSON state from VenueBuilder
    };

    // Distribution
    distribution?: {
        methods?: string[]; // Multi-select support
        isFree?: boolean;
        method: string; // Legacy support
        hasGuestList: boolean;
        guestCount: number;
        uploadedGuests?: Array<{
            id: number;
            Name: string;
            Email: string;
            Zone: string;
            Seat?: string;
            Status: string;
            ticketId: string;
            isGeneric?: boolean;
            // Check-in tracking
            checkedIn?: boolean;
            checkInTime?: Date;
            checkInBy?: string; // UID of staff who checked in
            // Finance
            paymentMethod?: string; // 'Efectivo', 'Nequi', 'Tarjeta', etc.
            soldBy?: string; // Email of seller
        }>;
    };

    // Metadata
    status: 'draft' | 'published' | 'archived';
    organizerId: string;
    organizerEmail?: string;
    createdAt?: any;

    // Legacy fields (optional to avoid breaking old code immediately)
    capacity?: number;
    price?: number;
    imageUrl?: string;

    // Microsite
    microsite?: {
        enabled: boolean;
        subdomain: string;
        theme: any; // GeneratedTheme
        publishedAt?: string;
    };
}

