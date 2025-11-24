// Role-based access control utilities

import { AppUser, UserRole } from '../../types/user';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Check if user has a specific role
 */
export function hasRole(user: AppUser | null, role: UserRole): boolean {
    return user?.role === role;
}

/**
 * Check if user is an organizer
 */
export function isOrganizer(user: AppUser | null): boolean {
    return hasRole(user, 'organizer');
}

/**
 * Check if user is staff
 */
export function isStaff(user: AppUser | null): boolean {
    return hasRole(user, 'staff');
}

/**
 * Verify if staff user can access a specific event
 */
export function canAccessEvent(user: AppUser | null, eventId: string): boolean {
    if (!user) return false;

    // Organizers can access all their events
    if (isOrganizer(user)) return true;

    // Staff can only access assigned events
    if (isStaff(user)) {
        return user.assignedEvents?.includes(eventId) || false;
    }

    return false;
}

/**
 * Create a new staff user
 */
export async function createStaffUser(
    email: string,
    password: string,
    assignedEvents: string[],
    organizerId: string,
    permissions: { canViewAttendeeDetails: boolean; canExportData: boolean }
): Promise<AppUser> {
    try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Create user document in Firestore
        const userData: AppUser = {
            uid,
            email,
            role: 'staff',
            createdAt: new Date(),
            assignedEvents,
            createdBy: organizerId,
            permissions,
        };

        await setDoc(doc(db, 'users', uid), userData);

        return userData;
    } catch (error: any) {
        console.error('Error creating staff user:', error);

        // Provide user-friendly error messages
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Este email ya está registrado. Por favor usa otro email.');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('El email proporcionado no es válido.');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('La contraseña debe tener al menos 6 caracteres.');
        } else {
            throw new Error(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
        }
    }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one uppercase, one lowercase, one number, one special char
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Fill the rest
    for (let i = 4; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}
