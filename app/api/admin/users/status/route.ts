import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth/api-auth';

export async function POST(request: NextRequest) {
    // 1. Verify Authentication
    const decodedToken = await verifyAuth(request);
    if (!decodedToken) {
        return unauthorizedResponse();
    }

    try {
        // 2. Verify Role (Must be superadmin)
        // We fetch the user document to check the role, as custom claims might not be set or up to date
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        if (!userData || userData.role !== 'superadmin') {
            return NextResponse.json(
                { error: 'Forbidden: Insufficient permissions' },
                { status: 403 }
            );
        }

        const { uid, action } = await request.json();

        if (!uid || !action) {
            return NextResponse.json({ error: 'UID and action are required' }, { status: 400 });
        }

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

        // 3. Update Firebase Auth
        await adminAuth.updateUser(uid, { disabled });

        // 4. Update Firestore
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
