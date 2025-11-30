import { NextRequest, NextResponse } from 'next/server';
import { generateBatchTicketPDF } from '@/lib/email/generateTicketPDF';

export async function POST(request: NextRequest) {
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
