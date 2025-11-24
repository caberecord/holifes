import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Delete from Firebase Authentication
        try {
            await adminAuth.deleteUser(userId);
        } catch (authError: any) {
            // Si el usuario no existe en Auth, continuar con la eliminación de Firestore
            if (authError.code !== 'auth/user-not-found') {
                throw authError;
            }
        }

        // Delete from Firestore
        await adminDb.collection('users').doc(userId).delete();

        return NextResponse.json(
            { success: true, message: 'User deleted successfully from both Auth and Firestore' },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete user' },
            { status: 500 }
        );
    }
}
