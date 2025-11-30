import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, token, isSandbox, invoiceData } = body;

        if (!email || !token || !invoiceData) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
        }

        const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
        const baseUrl = isSandbox ? "https://sandbox-api.alegra.com/api/v1" : "https://api.alegra.com/api/v1";

        // 1. Emit Invoice (Electronic Invoice for Colombia)
        // Endpoint: /e-provider/col/v1/invoices (Specific for Colombia Electronic Invoicing)
        // Or generic /invoices if not using electronic invoicing features yet, but user asked for "factura electronica"

        // NOTE: For simplicity in this first iteration, we use the standard /invoices endpoint which creates a draft or open invoice.
        // To emit to DIAN, we usually need to call /invoices with specific payload or a separate endpoint depending on Alegra version.
        // According to documentation, POST /api/v1/invoices creates the invoice. 
        // If "status": "open", it might trigger emission if configured.

        const response = await fetch(`${baseUrl}/invoices`, {
            method: 'POST',
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invoiceData)
        });

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json({ success: true, invoice: data });
        } else {
            const errorData = await response.json();
            return NextResponse.json({
                success: false,
                error: errorData.message || "Error al crear factura",
                details: errorData
            }, { status: response.status });
        }

    } catch (error: any) {
        console.error("Error in Alegra Invoices POST:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
