
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
        const { ticketId, email, eventId } = body;

        if (!ticketId || !email || !eventId) {
            return NextResponse.json(
                { error: 'Missing required fields: ticketId, email, eventId' },
                { status: 400 }
            );
        }

        // Generate HMAC signature
        const dataToSign = `${ticketId}:${email}:${eventId}`;
        const signature = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(dataToSign)
            .digest('hex');

        // Return the full secure ticket ID (ticketId + signature)
        const secureTicketId = `${ticketId}.${signature}`;

        return NextResponse.json({ secureTicketId, signature });

    } catch (error: any) {
        console.error('Error signing ticket:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to sign ticket' },
            { status: 500 }
        );
    }
}
