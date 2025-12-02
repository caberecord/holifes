import { z } from 'zod';

export const EventBasicInfoSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    date: z.string().min(1, "La fecha es requerida"),
    startTime: z.string().min(1, "La hora de inicio es requerida"),
    endTime: z.string().min(1, "La hora de fin es requerida"),
    location: z.string().min(3, "La ciudad/ubicación es requerida"),
    address: z.string().min(5, "La dirección exacta es requerida"),
    googleMapsUrl: z.string().optional(),
    category: z.string().min(1, "Selecciona una categoría"),
    description: z.string().max(500, "Máximo 500 caracteres"),
});

export type EventBasicInfo = z.infer<typeof EventBasicInfoSchema>;

export const EventPlanSchema = z.object({
    plan: z.enum(['freemium-a', 'freemium-b', 'pro', 'enterprise']),
});

export const EventDistributionSchema = z.object({
    methods: z.array(z.string()).min(1, "Selecciona al menos un método de distribución"),
    // Add more validation for specific methods if needed
});
