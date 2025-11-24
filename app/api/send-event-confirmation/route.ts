import { NextResponse } from 'next/server';
import { sendEventConfirmationEmail } from '../../../lib/email/sendEventConfirmation';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, userName, event } = body;

        if (!email || !event) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await sendEventConfirmationEmail({
            email,
            userName: userName || 'Organizador',
            event,
        });

        return NextResponse.json({ success: true, message: 'Confirmation email sent' });
    } catch (error: any) {
        console.error('Error in send-event-confirmation API:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send confirmation email' },
            { status: 500 }
        );
    }
}
