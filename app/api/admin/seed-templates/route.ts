import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { INITIAL_TEMPLATES } from '../../../../lib/data/initialTemplates';

export async function GET() {
    try {
        const batch = adminDb.batch();
        const templatesRef = adminDb.collection('site_templates');

        for (const template of INITIAL_TEMPLATES) {
            const docRef = templatesRef.doc(template.id);
            batch.set(docRef, {
                ...template,
                createdAt: new Date()
            }, { merge: true });
        }

        await batch.commit();

        return NextResponse.json({
            message: 'Templates seeded successfully',
            count: INITIAL_TEMPLATES.length
        });
    } catch (error: any) {
        console.error('Error seeding templates:', error);
        return NextResponse.json(
            { message: 'Error seeding templates', error: error.message },
            { status: 500 }
        );
    }
}
