import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
    try {
        const { uid } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: 'UID is required' }, { status: 400 });
        }

        // Generate Custom Token
        const customToken = await adminAuth.createCustomToken(uid);

        return NextResponse.json({
            success: true,
            token: customToken
        });

    } catch (error: any) {
        console.error("Error generating impersonation token:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
