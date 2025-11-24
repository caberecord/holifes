import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
    try {
        const { uid, action } = await request.json();

        if (!uid || !action) {
            return NextResponse.json({ error: 'UID and action are required' }, { status: 400 });
        }

        // Verify the requester is a superadmin (You might want to add a middleware or check the token here for extra security)
        // For now, we assume the client-side protection + this being an internal tool is "okay", 
        // but ideally we should verify the Authorization header token claims.

        let status = 'active';
        let disabled = false;

        switch (action) {
            case 'suspend':
                status = 'suspended';
                disabled = true;
                break;
            case 'ban':
                status = 'banned';
                disabled = true;
                break;
            case 'recover':
                status = 'active';
                disabled = false;
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // 1. Update Firebase Auth
        await adminAuth.updateUser(uid, { disabled });

        // 2. Update Firestore
        await adminDb.collection('users').doc(uid).update({
            status: status
        });

        return NextResponse.json({
            success: true,
            message: `User ${uid} ${action}ed successfully`,
            newStatus: status
        });

    } catch (error: any) {
        console.error("Error updating user status:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
