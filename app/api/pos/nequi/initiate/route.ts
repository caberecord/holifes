// app/api/pos/nequi/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth/api-auth';
import { NequiService } from '@/lib/payments/nequi/service';

export async function POST(request: NextRequest) {
    const user = await verifyAuth(request);
    if (!user) {
        return unauthorizedResponse();
    }

    try {
        const { phone, amount, orderId } = await request.json();

        if (!phone || !amount || !orderId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Obtener credenciales de Nequi del usuario/organizador
        const companyDoc = await adminDb.doc(`users/${user.uid}/companyData/info`).get();
        const companyData = companyDoc.data();

        if (!companyData || !companyData.nequi || !companyData.nequi.isConnected) {
            return NextResponse.json({ error: 'Nequi not configured for this organizer' }, { status: 400 });
        }

        const nequiConfig = companyData.nequi;

        // 2. Inicializar servicio con credenciales dinámicas
        const service = new NequiService({
            clientId: nequiConfig.clientId,
            clientSecret: nequiConfig.clientSecret,
            apiKey: nequiConfig.apiKey,
            authUrl: nequiConfig.authUrl || "https://oauth.nequi.com/oauth2/v4/token",
            apiUrl: nequiConfig.apiUrl || "https://api.nequi.com"
        });

        // 3. Iniciar pago Push
        const { transactionId } = await service.createPushPayment(
            phone,
            amount,
            orderId
        );

        return NextResponse.json({ success: true, transactionId });

    } catch (error: any) {
        console.error('Error initiating Nequi payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to initiate payment' },
            { status: 500 }
        );
    }
}
