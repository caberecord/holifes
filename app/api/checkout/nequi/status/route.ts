// app/api/checkout/nequi/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { NequiService } from '@/lib/payments/nequi/service';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
        return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    try {
        const service = new NequiService();
        const status = await service.checkPaymentStatus(transactionId);

        return NextResponse.json(status);
    } catch (error: any) {
        console.error('Error checking Nequi status:', error);
        return NextResponse.json(
            { error: error.message || 'Error checking status' },
            { status: 500 }
        );
    }
}
