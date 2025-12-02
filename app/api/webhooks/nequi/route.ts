import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Log the incoming webhook for debugging/audit
        console.log('Recibido Webhook Nequi:', JSON.stringify(body, null, 2));

        // TODO: Validar firma digital si Nequi lo requiere en producción (x-signature)
        // Por ahora, en Sandbox, validamos que traiga la estructura básica
        if (!body || !body.ResponseMessage) {
            return NextResponse.json({ message: 'Invalid Payload' }, { status: 400 });
        }

        // Aquí se implementaría la lógica para actualizar el estado de la orden en la BD
        // const transactionId = body.ResponseMessage.ResponseHeader.MessageID;
        // await updateOrderStatus(transactionId, body...);

        return NextResponse.json({ message: 'Webhook Received' }, { status: 200 });
    } catch (error) {
        console.error('Error procesando webhook Nequi:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
