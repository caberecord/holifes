import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider, getTenantCredentials } from '@/lib/payments/factory';
import { CreateCheckoutParams } from '@/lib/payments/types';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
    try {
        // 1. Validar autenticación del usuario final (comprador)
        // Nota: Dependiendo del flujo, el comprador podría ser anónimo o estar logueado.
        // Aquí asumimos un flujo donde se pasa el token de sesión o se valida de alguna forma.
        // Por ahora, permitimos acceso público pero validamos el body.

        const body = await request.json();
        const {
            tenantId,
            orderId,
            amount,
            currency,
            description,
            payerEmail,
            applicationFee,
            connectedAccountId
        } = body;

        if (!tenantId || !amount || !connectedAccountId) {
            return NextResponse.json(
                { error: 'Faltan parámetros requeridos (tenantId, amount, connectedAccountId)' },
                { status: 400 }
            );
        }

        // 2. Obtener el proveedor de pagos configurado para este tenant
        const provider = await getPaymentProvider(tenantId);

        // 3. Obtener las credenciales desencriptadas del tenant (Just-in-Time)
        const credentials = await getTenantCredentials(tenantId);

        // 4. Preparar parámetros del checkout
        const checkoutParams: CreateCheckoutParams = {
            tenantId,
            orderId,
            amount,
            currency: currency || 'USD',
            description: description || 'Compra de tickets',
            payerEmail,
            applicationFee,
            connectedAccountId
        };

        // 5. Crear la sesión de pago
        const response = await provider.createCheckoutSession(checkoutParams, credentials);

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Error en Checkout API:', error);
        return NextResponse.json(
            { error: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
