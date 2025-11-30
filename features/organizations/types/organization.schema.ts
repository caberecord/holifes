import { z } from 'zod';

/**
 * Organization Schema
 * Source of truth for the Organization entity.
 */
export const OrganizationSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    slug: z.string()
        .min(3, "El slug debe tener al menos 3 caracteres")
        .regex(/^[a-z0-9-]+$/, "El slug solo puede contener letras minúsculas, números y guiones"),
    ownerId: z.string(), // ID of the user who owns the billing

    // Settings
    settings: z.object({
        logoUrl: z.union([z.string().url(), z.literal('')]).optional(),
        primaryColor: z.string().optional(), // Hex color for branding
        website: z.union([z.string().url(), z.literal('')]).optional(),
        currency: z.string().default('USD'), // e.g. 'USD', 'COP'
        timezone: z.string().default('UTC'), // e.g. 'America/Bogota'
        defaultLocale: z.string().default('es'), // e.g. 'es', 'en'
    }).optional(),

    // Enterprise Features
    ssoEnabled: z.boolean().default(false),
    domainVerified: z.boolean().default(false),

    // Fiscal Data (Consolidated from User Company Data)
    fiscalData: z.object({
        legalName: z.string().optional(),
        tradeName: z.string().optional(),
        taxId: z.string().optional(), // NIT/RUT
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(), // ISO Code
        phone: z.string().optional(),
        email: z.union([z.string().email(), z.literal('')]).optional(), // Billing Email
        website: z.union([z.string().url(), z.literal('')]).optional(),
        taxSystem: z.string().optional(), // Regimen Fiscal
        vatRate: z.number().optional(),
    }).optional(),

    // Metadata
    createdAt: z.preprocess((arg: any) => {
        if (typeof arg === 'object' && arg !== null && 'toDate' in arg && typeof arg.toDate === 'function') {
            return arg.toDate();
        }
        return arg;
    }, z.date()),
    updatedAt: z.preprocess((arg: any) => {
        if (typeof arg === 'object' && arg !== null && 'toDate' in arg && typeof arg.toDate === 'function') {
            return arg.toDate();
        }
        return arg;
    }, z.date()),
});

export type Organization = z.infer<typeof OrganizationSchema>;

// Schema for creating a new organization (omits system fields)
export const CreateOrganizationSchema = OrganizationSchema.pick({
    name: true,
    slug: true,
}).extend({
    // Additional fields for creation if needed
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
