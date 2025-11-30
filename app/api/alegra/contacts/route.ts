import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const identification = searchParams.get('identification');
        const email = searchParams.get('email');
        const token = searchParams.get('token');
        const isSandbox = searchParams.get('isSandbox') === 'true';

        if (!email || !token || !identification) {
            return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
        }

        const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
        const baseUrl = isSandbox ? "https://sandbox-api.alegra.com/api/v1" : "https://api.alegra.com/api/v1";

        // Search contact by identification (NIT/Cedula)
        // Alegra allows filtering by identification
        const response = await fetch(`${baseUrl}/contacts?identification=${identification}`, {
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Alegra returns an array. If empty, contact doesn't exist.
            return NextResponse.json({ found: data.length > 0, contact: data[0] || null });
        } else {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData.message || "Error al buscar contacto" }, { status: response.status });
        }

    } catch (error: any) {
        console.error("Error in Alegra Contacts GET:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, token, isSandbox, contactData, localContactId } = body;

        if (!email || !token || !contactData) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
        }

        const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
        const baseUrl = isSandbox ? "https://sandbox-api.alegra.com/api/v1" : "https://api.alegra.com/api/v1";

        // Create Contact
        const response = await fetch(`${baseUrl}/contacts`, {
            method: 'POST',
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        if (response.ok) {
            const data = await response.json();

            // Sync back to Firestore if localContactId is provided
            if (localContactId && data.id) {
                try {
                    const contactRef = doc(db, "contacts", localContactId);
                    await updateDoc(contactRef, {
                        alegraId: String(data.id),
                        updatedAt: serverTimestamp()
                    });
                    console.log(`Synced Alegra ID ${data.id} to local contact ${localContactId}`);
                } catch (firestoreError) {
                    console.error("Error syncing Alegra ID to Firestore:", firestoreError);
                    // Don't fail the request, just log the error
                }
            }

            return NextResponse.json({ success: true, contact: data });
        } else {
            const errorData = await response.json();
            console.error("Alegra Contact Create Error:", JSON.stringify(errorData, null, 2));
            // Return more details to the client
            const detailedError = errorData.message || JSON.stringify(errorData);
            return NextResponse.json({
                success: false,
                error: detailedError,
                details: errorData
            }, { status: response.status });
        }

    } catch (error: any) {
        console.error("Error in Alegra Contacts POST:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { email, token, isSandbox, contactId, contactData, localContactId } = body;

        if (!email || !token || !contactId || !contactData) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
        }

        const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
        const baseUrl = isSandbox ? "https://sandbox-api.alegra.com/api/v1" : "https://api.alegra.com/api/v1";

        // Update Contact
        const response = await fetch(`${baseUrl}/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        if (response.ok) {
            const data = await response.json();

            // Sync back to Firestore if localContactId is provided
            if (localContactId && data.id) {
                try {
                    const contactRef = doc(db, "contacts", localContactId);
                    await updateDoc(contactRef, {
                        alegraId: String(data.id),
                        updatedAt: serverTimestamp()
                    });
                    console.log(`Synced Alegra ID ${data.id} to local contact ${localContactId}`);
                } catch (firestoreError) {
                    console.error("Error syncing Alegra ID to Firestore:", firestoreError);
                }
            }

            return NextResponse.json({ success: true, contact: data });
        } else {
            const errorData = await response.json();
            console.error("Alegra Contact Update Error:", JSON.stringify(errorData, null, 2));
            const detailedError = errorData.message || JSON.stringify(errorData);
            return NextResponse.json({
                success: false,
                error: detailedError,
                details: errorData
            }, { status: response.status });
        }

    } catch (error: any) {
        console.error("Error in Alegra Contacts PUT:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
