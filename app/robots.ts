import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://tudominio.com'; // Replace with actual base domain

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
