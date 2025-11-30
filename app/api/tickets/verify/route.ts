
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth/api-auth';

const SECRET_KEY = process.env.NEXT_PUBLIC_TICKET_SECRET_KEY || "default-secret-key";

export async function POST(request: NextRequest) {
    // Verify Authentication
    const user = await verifyAuth(request);
    if (!user) {
        return unauthorizedResponse();
    }

    try {
        const body = await request.json();
        const { ticketId, email, eventId, signature } = body;

        if (!ticketId || !email || !eventId || !signature) {
            return NextResponse.json(
                { error: 'Missing required fields: ticketId, email, eventId, signature' },
                { status: 400 }
            );
        }

        // 1. Try with normalized email (Standard)
        const normalizedEmail = email.toLowerCase().trim();
        const dataToSign = `${ticketId}:${normalizedEmail}:${eventId}`;

        const generatedSignature = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(dataToSign)
            .digest('hex')
            .toUpperCase();

        if (generatedSignature === signature.toUpperCase()) {
            return NextResponse.json({ valid: true });
        }

        // 2. Fallback: Try with raw email (Legacy)
        if (email !== normalizedEmail) {
            const dataToSignRaw = `${ticketId}:${email}:${eventId}`;
            const generatedSignatureRaw = crypto
                .createHmac('sha256', SECRET_KEY)
                .update(dataToSignRaw)
                .digest('hex')
                .toUpperCase();

            if (generatedSignatureRaw === signature.toUpperCase()) {
                return NextResponse.json({ valid: true, isLegacy: true });
            }
        }

        return NextResponse.json({ valid: false });

    } catch (error: any) {
        console.error('Error verifying ticket:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify ticket' },
            { status: 500 }
        );
    }
}
