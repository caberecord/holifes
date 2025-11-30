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

    // ISO Date strings (computed or stored)
    startDate?: string;
    endDate?: string;
    locationName?: string;

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
            qrPayload?: string; // JSON QR payload (new secure format)
            isGeneric?: boolean;
            // Check-in tracking
            checkedIn?: boolean;
            checkInTime?: Date;
            checkInBy?: string; // UID of staff who checked in
            // Finance
            paymentMethod?: string; // 'Efectivo', 'Nequi', 'Tarjeta', etc.
            soldBy?: string; // Email of seller
            purchaseDate?: string; // ISO date string from POS sales
        }>;
    };

    // Metadata
    status: 'draft' | 'published' | 'archived';
    organizerId: string;
    organizationId?: string | null; // Multi-tenant support
    organizerEmail?: string;
    createdAt?: any;

    // Legacy fields (optional to avoid breaking old code immediately)
    capacity?: number;
    price?: number;
    imageUrl?: string;
    coverImage?: string; // Event cover/thumbnail image

    // Microsite (legacy - will migrate to new fields below)
    microsite?: {
        enabled: boolean;
        subdomain: string;
        theme: any; // GeneratedTheme
        publishedAt?: string;
    };

    // === NEW: Multi-Tenant Site Builder Fields ===

    // Subdomain único para el evento (ej. "concierto2025")
    subdomain?: string;

    // Estado del sitio público
    status_site?: 'draft' | 'published' | 'unpublished' | 'archived';

    // Diseño del sitio (JSON de Puck editor)
    layout_data?: any; // Puck JSON structure

    // Versión del diseño (para tracking de cambios)
    layout_version?: number;

    // Tipo de evento (para componentes específicos)
    event_type?: 'concert' | 'conference' | 'workshop' | 'corporate' | 'religious' | 'academic' | 'school' | 'festival' | 'sports' | 'other';

    // Campos personalizados flexibles (JSONB-style)
    custom_fields?: {
        // Para conciertos: { genre, sound_check_time, setlist }
        // Para conferencias: { tracks, cme_credits, certificate_template }
        // Para religiosos: { denomination, liturgy_type, dress }
        [key: string]: any;
    };

    // Tags para búsquedas y SEO
    tags?: string[];

    // Enlaces sociales
    social_links?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
        tiktok?: string;
        [key: string]: string | undefined;
    };

    // Stats (Aggregated data for scalability)
    stats?: {
        totalSold: number;
        totalRevenue: number;
        soldByZone: Record<string, number>;
        attendeesCount: number;
        checkedInCount: number;
    };

    // Speakers (Legacy or direct field)
    speakers?: any[];
}

