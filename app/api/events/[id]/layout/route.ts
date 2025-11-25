import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * API para manejar el layout del sitio de eventos
 * GET: Obtiene el layout actual
 * POST: Guarda el layout del editor Puck
 */

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const eventId = params.id;
        // Usar Admin SDK
        const eventDoc = await adminDb.collection('events').doc(eventId).get();

        if (!eventDoc.exists) {
            return NextResponse.json(
                { message: 'Evento no encontrado' },
                { status: 404 }
            );
        }

        const eventData = eventDoc.data();

        return NextResponse.json({
            layout_data: eventData?.layout_data || null,
            layout_version: eventData?.layout_version || 1,
        });
    } catch (error) {
        console.error('Error fetching layout:', error);
        return NextResponse.json(
            { message: 'Error al obtener el layout' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const eventId = params.id;
        const body = await request.json();
        const { layout_data } = body;

        if (!layout_data) {
            return NextResponse.json(
                { message: 'layout_data es requerido' },
                { status: 400 }
            );
        }

        const eventRef = adminDb.collection('events').doc(eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return NextResponse.json(
                { message: 'Evento no encontrado' },
                { status: 404 }
            );
        }

        // Actualizar layout usando Admin SDK
        // ignoreUndefinedProperties ya está configurado en lib/firebaseAdmin.ts
        const updateData: any = {
            layout_data,
            layout_version: FieldValue.increment(1),
            updated_at: FieldValue.serverTimestamp(),
        };

        // Si se solicita publicar
        if (body.publish) {
            updateData.status_site = 'published';

            // Generar subdominio si no existe
            const currentData = eventDoc.data();
            if (!currentData?.subdomain) {
                // Generar slug básico: nombre-evento-id
                const nameSlug = (currentData?.name || 'evento')
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                // Añadir sufijo aleatorio corto para unicidad
                const suffix = Math.random().toString(36).substring(2, 6);
                updateData.subdomain = `${nameSlug}-${suffix}`;
            }
        }

        await eventRef.update(updateData);

        return NextResponse.json({
            message: 'Layout guardado exitosamente',
            layout_version: (eventDoc.data()?.layout_version || 0) + 1,
        });
    } catch (error: any) {
        console.error('CRITICAL ERROR saving layout:', error);

        if (error.code === 'resource-exhausted') {
            return NextResponse.json(
                { message: 'El diseño es demasiado grande (Límite 1MB). Intenta reducir el contenido.' },
                { status: 413 }
            );
        }
        return NextResponse.json(
            { message: `Error al guardar el layout: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
