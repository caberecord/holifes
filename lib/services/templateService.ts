import { adminDb } from '../firebaseAdmin';
import { SiteTemplate } from '../../types/template';
import { FieldValue } from 'firebase-admin/firestore';

export async function getTemplates(): Promise<SiteTemplate[]> {
    try {
        const templatesRef = adminDb.collection('site_templates');
        const snapshot = await templatesRef.where('is_active', '==', true).get();

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SiteTemplate));
    } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
    }
}

export async function applyTemplate(eventId: string, templateId: string): Promise<boolean> {
    try {
        // 1. Get the template
        const templateRef = adminDb.collection('site_templates').doc(templateId);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            throw new Error('Template not found');
        }

        const templateData = templateDoc.data() as SiteTemplate;

        // 2. Update the event
        const eventRef = adminDb.collection('events').doc(eventId);
        await eventRef.update({
            layout_data: templateData.layout_data,
            layout_version: FieldValue.increment(1),
            updated_at: FieldValue.serverTimestamp(),
            // Optional: Store which template was used
            template_id: templateId
        });

        return true;
    } catch (error) {
        console.error('Error applying template:', error);
        throw error;
    }
}
