import { z } from 'zod';

// Sub-schemas for complex objects
const CoordinatesSchema = z.object({
    lat: z.number(),
    lng: z.number(),
});

const ZoneSchema = z.object({
    id: z.string(),
    name: z.string(),
    capacity: z.number(),
    price: z.number(),
    color: z.string(),
    type: z.enum(['standing', 'seating']).optional(),
    shape: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    rotation: z.number().optional(),
});

const VenueSchema = z.object({
    type: z.string(),
    totalCapacity: z.number(),
    zones: z.array(ZoneSchema),
    venueMap: z.any().optional(), // JSON state from VenueBuilder
});

const GuestSchema = z.object({
    id: z.number(),
    Name: z.string(),
    Email: z.string().email(),
    Zone: z.string(),
    Seat: z.string().optional(),
    Status: z.string(),
    ticketId: z.string(),
    qrPayload: z.string().optional(),
    isGeneric: z.boolean().optional(),
    checkedIn: z.boolean().optional(),
    checkInTime: z.date().optional(), // Changed to Date for Zod, might need string transform if incoming is string
    checkInBy: z.string().optional(),
    paymentMethod: z.string().optional(),
    soldBy: z.string().optional(),
    purchaseDate: z.string().optional(),
});

const DistributionSchema = z.object({
    methods: z.array(z.string()).optional(),
    isFree: z.boolean().optional(),
    method: z.string(), // Legacy
    hasGuestList: z.boolean(),
    guestCount: z.number(),
    uploadedGuests: z.array(GuestSchema).optional(),
});

const SocialLinksSchema = z.record(z.string(), z.string().optional());

/**
 * Event Schema
 * Source of truth for the Event entity.
 */
export const EventSchema = z.object({
    id: z.string().optional(),

    // Basic Info
    name: z.string().min(1, "El nombre es obligatorio"),
    title: z.string().optional(), // Legacy
    description: z.string(),
    date: z.string(), // YYYY-MM-DD
    startTime: z.string(),
    endTime: z.string(),
    location: z.string(),
    address: z.string().optional(),
    googleMapsUrl: z.string().url().optional(),
    coordinates: CoordinatesSchema.optional(),
    category: z.string().optional(),

    // ISO Date strings
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    locationName: z.string().optional(),

    // Plan
    plan: z.string().optional(),

    // Complex Objects
    venue: VenueSchema.optional(),
    distribution: DistributionSchema.optional(),

    // Metadata
    status: z.enum(['draft', 'published', 'archived']),

    // Ownership
    organizerId: z.string(), // Legacy: User ID
    organizationId: z.string().optional(), // NEW: Organization ID (Optional during migration)
    organizerEmail: z.string().email().optional(),

    createdAt: z.any().optional(), // Firestore Timestamp or Date

    // Legacy fields
    capacity: z.number().optional(),
    price: z.number().optional(),
    imageUrl: z.string().optional(),

    // Microsite (Legacy)
    microsite: z.object({
        enabled: z.boolean(),
        subdomain: z.string(),
        theme: z.any(),
        publishedAt: z.string().optional(),
    }).optional(),

    // Site Builder Fields
    subdomain: z.string().optional(),
    status_site: z.enum(['draft', 'published', 'unpublished', 'archived']).optional(),
    layout_data: z.any().optional(),
    layout_version: z.number().optional(),
    event_type: z.enum(['concert', 'conference', 'workshop', 'corporate', 'religious', 'academic', 'school', 'festival', 'sports', 'other']).optional(),
    custom_fields: z.record(z.string(), z.any()).optional(),
    tags: z.array(z.string()).optional(),
    social_links: SocialLinksSchema.optional(),
    speakers: z.array(z.any()).optional(),
});

export type Event = z.infer<typeof EventSchema>;
