import { MetadataRoute } from 'next';
import { adminDb } from '../lib/firebaseAdmin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://tudominio.com'; // Replace with actual base domain

    // Fetch all published events
    const eventsRef = adminDb.collection('events');
    const snapshot = await eventsRef.where('status_site', '==', 'published').get();

    const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            url: `https://${data.subdomain}.tudominio.com`, // Subdomain logic
            lastModified: data.updatedAt?.toDate?.() || new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        };
    });

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...events,
    ];
}
