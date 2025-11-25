import { NextRequest, NextResponse } from 'next/server';
import { applyTemplate } from '../../../../../lib/services/templateService';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const eventId = params.id;
        const body = await request.json();
        const { templateId } = body;

        if (!templateId) {
            return NextResponse.json({ message: 'Template ID required' }, { status: 400 });
        }

        await applyTemplate(eventId, templateId);

        return NextResponse.json({ message: 'Template applied successfully' });
    } catch (error: any) {
        console.error('Error applying template:', error);
        return NextResponse.json(
            { message: 'Error applying template', error: error.message },
            { status: 500 }
        );
    }
}
