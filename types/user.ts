// User and Authentication Types

export interface UserPermissions {
    canViewAttendeeDetails: boolean; // If true, can see full attendee info
    canExportData: boolean; // Future: allow CSV exports
}

export type UserRole = 'organizer' | 'staff' | 'superadmin';

export interface AppUser {
    uid: string;
    email: string;
    role: UserRole;
    status?: 'active' | 'suspended' | 'banned'; // User status
    createdAt: Date;
    displayName?: string; // User's display name
    phone?: string; // User's phone number
    accountType?: 'personal' | 'business'; // Type of account
    // Staff-specific fields
    assignedEvents?: string[]; // Array of event IDs
    createdBy?: string; // UID of organizer who created this staff user
    permissions?: UserPermissions;
}

// Check-in related types
export interface CheckInInfo {
    checkedIn: boolean;
    checkInTime?: Date;
    checkInBy?: string; // UID of staff who checked in
}

export type ValidationStatus =
    | 'VALID'
    | 'ALREADY_CHECKED_IN'
    | 'INVALID'
    | 'WRONG_EVENT'
    | 'EXPIRED';

export interface ValidationResult {
    status: ValidationStatus;
    attendee?: any;
    message: string;
    checkInInfo?: CheckInInfo;
}
