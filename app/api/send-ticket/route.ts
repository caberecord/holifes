import { NextRequest, NextResponse } from 'next/server';
import { sendTicketEmail } from '../../../lib/email/sendTicket';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            email,
            attendeeName,
            eventName,
            eventDate,
            eventTime,
            eventLocation,
            ticketId,
            eventId,
            qrPayload,
            zone,
            seat
        } = body;

        // Validate required fields
        if (!email || !ticketId || !eventName) {
            return NextResponse.json(
                { error: 'Missing required fields (email, ticketId, eventName)' },
                { status: 400 }
            );
        }

        await sendTicketEmail({
            email,
            attendeeName: attendeeName || 'Asistente',
            eventName,
            eventDate: eventDate || 'Fecha por confirmar',
            eventTime: eventTime || '--:--',
            eventLocation: eventLocation || 'Ubicación por confirmar',
            ticketId,
            eventId,
            qrPayload,
            zone: zone || 'General',
            seat,
        });

        return NextResponse.json({ success: true, message: 'Ticket sent successfully' });
    } catch (error: any) {
        console.error('Error in send-ticket route:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send ticket' },
            { status: 500 }
        );
    }
}
