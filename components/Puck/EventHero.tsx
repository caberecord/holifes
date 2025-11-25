'use client';

import { useEventContext } from '../../lib/context/EventContext';

interface EventHeroProps {
    // Config
    height?: string;
    overlayOpacity?: number;

    // Content
    // title se toma del evento
    // backgroundImage se toma del evento
    // ctaText eliminado
    // ctaLink eliminado

    // Style
    titleAlignment?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export const EventHero = ({
    height = "600px",
    overlayOpacity = 0.5,
    titleAlignment = 'center',
    backgroundColor,
    textColor,
    fontFamily = "modern"
}: EventHeroProps) => {
    const event = useEventContext();

    // Font mapping
    const fontMap: Record<string, string> = {
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
        harlow: 'font-harlow',
        curlz: 'font-curlz',
        baguet: 'font-baguet',
        cascadia: 'font-cascadia',
        varsity: 'font-varsity',
        freshman: 'font-freshman',
        // Fallbacks
        modern: 'font-inter',
        bold: 'font-anton',
        serif: 'font-playfair',
        mono: 'font-space'
    };

    const fontClass = fontMap[fontFamily] || fontMap.modern;
    const actualTitle = event?.name || "Título del Evento";

    // Prioridad: Imagen del evento -> Placeholder
    const actualImage = event?.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30";

    // Alignment classes
    const alignmentClass = {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-end text-right'
    }[titleAlignment] || 'items-center text-center';

    return (
        <section
            className="relative w-full overflow-hidden"
            style={{ height }}
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${actualImage})`,
                }}
            />

            {/* Overlay */}
            <div
                className="absolute inset-0 transition-colors duration-300"
                style={{
                    backgroundColor: backgroundColor || '#000000',
                    opacity: overlayOpacity
                }}
            />

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
                <div className={`flex flex-col ${alignmentClass} max-w-4xl mx-auto w-full`}>
                    <h1
                        className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight ${fontClass}`}
                        style={{ color: textColor || '#ffffff' }}
                    >
                        {actualTitle}
                    </h1>

                    {/* Date/Time Badge if available */}
                    {event?.startDate && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-8">
                            <span className="text-sm font-medium">
                                {new Date(event.startDate).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
