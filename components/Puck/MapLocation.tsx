'use client';

import { useEventContext } from '../../lib/context/EventContext';

interface MapLocationProps {
    showMap: boolean;
    showAddress: boolean;
    showDirections: boolean;
    mapZoom: number;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export function MapLocation({
    showMap,
    showAddress,
    showDirections,
    mapZoom,
    backgroundColor,
    textColor,
    fontFamily = "inter"
}: MapLocationProps) {
    const event = useEventContext();

    const location = event?.location;
    const address = event?.address; // Assuming address might be available in event object
    const googleMapsUrl = event?.googleMapsUrl;
    const coordinates = event?.coordinates;

    const fontClass = {
        inter: 'font-inter',
        montserrat: 'font-montserrat',
        playfair: 'font-playfair',
        oswald: 'font-oswald',
        poppins: 'font-poppins',
        merriweather: 'font-merriweather',
        anton: 'font-anton',
        cormorant: 'font-cormorant',
        lilita: 'font-lilita',
        space: 'font-space',
        // Fallbacks
        modern: 'font-inter',
        bold: 'font-anton',
        retro: 'font-space',
    }[fontFamily] || 'font-inter';

    if (!location) {
        return (
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ubicación</h2>
                    <p className="text-gray-500">No se ha configurado la ubicación del evento</p>
                </div>
            </section>
        );
    }

    // Construir URL del mapa embebido
    // Usamos la versión "output=embed" que es más flexible y no requiere API Key obligatoria para búsquedas simples
    const query = coordinates
        ? `${coordinates.lat},${coordinates.lng}`
        : address || location;

    const mapSrc = query
        ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`
        : null;

    return (
        <section
            className={`py-16 px-4 ${fontClass}`}
            style={{
                backgroundColor: backgroundColor || '#F9FAFB',
                color: textColor || '#111827'
            }}
        >
            <div className="max-w-6xl mx-auto">
                <h2
                    className="text-4xl font-bold text-center mb-12"
                    style={{ color: textColor || '#111827' }}
                >
                    Ubicación
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Map */}
                    {showMap && mapSrc && (
                        <div className="order-2 md:order-1">
                            <iframe
                                src={mapSrc}
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    )}

                    {/* Info */}
                    <div className={`order-1 md:order-2 flex flex-col justify-center ${!showMap ? 'md:col-span-2' : ''}`}>
                        <h3
                            className="text-2xl font-bold mb-4"
                            style={{ color: textColor || '#111827' }}
                        >
                            {location}
                        </h3>

                        {showAddress && address && (
                            <p
                                className="mb-6 text-lg"
                                style={{ color: textColor ? `${textColor}CC` : '#4B5563' }}
                            >
                                {address}
                            </p>
                        )}

                        {showDirections && (googleMapsUrl || coordinates) && (
                            <a
                                href={googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${coordinates?.lat},${coordinates?.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors w-fit"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Cómo Llegar
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
