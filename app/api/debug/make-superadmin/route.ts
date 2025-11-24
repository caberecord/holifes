import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find user by email
        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();

        if (snapshot.empty) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update user role
        const userDoc = snapshot.docs[0];
        await userDoc.ref.update({
            role: 'superadmin'
        });

        return NextResponse.json({
            success: true,
            message: `User ${email} is now a Super Admin! 🦸‍♂️`
        });

    } catch (error: any) {
        console.error("Error promoting user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
