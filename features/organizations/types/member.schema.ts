import { z } from 'zod';

/**
 * Organization Roles
 */
export const OrganizationRoleEnum = z.enum(['owner', 'admin', 'member', 'viewer', 'staff']);
export type OrganizationRole = z.infer<typeof OrganizationRoleEnum>;

/**
 * Organization Member Schema
 * Represents the link between a User and an Organization.
 */
export const OrganizationMemberSchema = z.object({
    id: z.string(), // Composite key: orgId_userId
    organizationId: z.string(),
    userId: z.string(),
    role: OrganizationRoleEnum,

    // Staff Specific Fields
    permissions: z.object({
        canViewAttendeeDetails: z.boolean().default(false),
        canExportData: z.boolean().default(false),
        canSell: z.boolean().default(false),
    }).optional(),
    assignedEvents: z.array(z.string()).optional(), // List of Event IDs

    // Metadata
    joinedAt: z.date(),
    invitedBy: z.string().optional(), // User ID of the inviter
    status: z.enum(['active', 'invited', 'suspended']).default('active'),
});

export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;
