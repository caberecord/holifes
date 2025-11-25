import { NextResponse } from 'next/server';
import { getTemplates } from '../../../lib/services/templateService';

export async function GET() {
    const templates = await getTemplates();
    return NextResponse.json(templates);
}
