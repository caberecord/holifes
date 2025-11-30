import { NextRequest, NextResponse } from 'next/server';
import { generateBatchTicketPDF } from '@/lib/email/generateTicketPDF';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth/api-auth';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function POST(request: NextRequest) {
    // Verify Authentication
    const user = await verifyAuth(request);
    if (!user) {
        return unauthorizedResponse();
    }

    try {
        await limiter.check(NextResponse.next(), 10, user.uid); // 10 requests per minute
    } catch {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const { tickets } = body;

        if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
            return NextResponse.json(
                { error: 'Missing tickets array' },
                { status: 400 }
            );
        }

        console.log(`Generating batch PDF for ${tickets.length} tickets`);

        const pdfBuffer = await generateBatchTicketPDF(tickets);

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="tickets-${Date.now()}.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('Error generating batch PDF:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
