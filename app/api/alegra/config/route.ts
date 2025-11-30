import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { action, email, token, isSandbox } = await req.json();

        if (action === 'TEST') {
            if (!email || !token) {
                return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
            }

            // Construct Basic Auth Header
            const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
            const baseUrl = isSandbox ? "https://sandbox-api.alegra.com/api/v1" : "https://api.alegra.com/api/v1";

            // Call Alegra API (Get Company Info)
            const response = await fetch(`${baseUrl}/company`, {
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return NextResponse.json({ success: true, company: data });
            } else {
                const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
                console.error("Alegra API Error:", response.status, errorData);

                let errorMessage = errorData.message || "Error al conectar con Alegra";

                if (response.status === 401) {
                    errorMessage = "Credenciales inválidas. Verifica que tu correo y token correspondan al entorno seleccionado (Sandbox vs Producción).";
                }

                return NextResponse.json({
                    success: false,
                    error: errorMessage,
                    details: { status: response.status, ...errorData }
                }, { status: response.status });
            }
        }

        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });

    } catch (error: any) {
        console.error("Error in Alegra Config API:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
