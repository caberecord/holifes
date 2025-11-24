import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST() {
    try {
        // 1. Delete all events
        const eventsSnapshot = await adminDb.collection('events').get();
        const batch = adminDb.batch();
        let deleteCount = 0;

        eventsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
            deleteCount++;
        });

        // 2. Delete all staff (users with role 'staff')
        const staffSnapshot = await adminDb.collection('users').where('role', '==', 'staff').get();

        staffSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
            deleteCount++;
        });

        if (deleteCount > 0) {
            await batch.commit();
        }

        return NextResponse.json({
            success: true,
            message: `Limpieza completada: ${eventsSnapshot.size} eventos y ${staffSnapshot.size} miembros del staff eliminados.`
        });

    } catch (error: any) {
        console.error("Error cleaning database:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
