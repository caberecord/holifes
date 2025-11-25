import { Event } from '../../types/event';

interface EventJsonLdProps {
    event: Event;
}

export function EventJsonLd({ event }: EventJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        startDate: event.startDate || `${event.date}T${event.startTime}:00`,
        endDate: event.endDate || `${event.date}T${event.endTime}:00`,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
            '@type': 'Place',
            name: event.locationName || event.location || 'Ubicación por definir',
            address: {
                '@type': 'PostalAddress',
                streetAddress: event.address || '',
                addressCountry: 'CO', // Default to Colombia for now, or make dynamic
            },
        },
        image: [
            event.layout_data?.root?.props?.image || event.layout_data?.root?.props?.backgroundImage || '',
        ].filter(Boolean),
        description: event.description || `Entradas para ${event.name}`,
        offers: {
            '@type': 'Offer',
            url: `https://${event.subdomain}.tudominio.com`, // Replace with actual domain logic
            availability: 'https://schema.org/InStock',
            price: '0', // Dynamic price logic needed if we have ticket types accessible here
            priceCurrency: 'COP',
        },
        organizer: {
            '@type': 'Organization',
            name: 'Tu Plataforma de Eventos', // Replace with organizer name if available
            url: 'https://tudominio.com',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
