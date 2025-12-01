import { z } from 'zod';

export const ZoneSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "El nombre de la zona es requerido"),
    type: z.enum(['seating', 'standing', 'general']),
    price: z.number().min(0, "El precio no puede ser negativo"),
    capacity: z.number().min(1, "La capacidad debe ser al menos 1"),
    color: z.string().optional(),
});

export const AllocatableUnitSchema = z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    rotation: z.number().optional(),
    type: z.string(), // 'seat', 'table', 'general', etc.
    zoneId: z.string().optional(),
    label: z.string().optional(),
    // Specific props for different shapes
    radius: z.number().optional(),
    innerRadius: z.number().optional(),
    curveRadius: z.number().optional(),
    curveAngle: z.number().optional(),
});

export const VenueMapSchema = z.object({
    canvasSize: z.object({
        width: z.number(),
        height: z.number(),
    }),
    elements: z.array(AllocatableUnitSchema),
    zones: z.array(ZoneSchema),
    backgroundImage: z.string().optional().nullable(),
});

export type VenueMap = z.infer<typeof VenueMapSchema>;
