'use client';

import { useEventContext } from '../../lib/context/EventContext';

interface EventHeroProps {
    // Config
    height?: string;
    overlayOpacity?: number;

    // Content
    image?: string; // Imagen manual desde Puck
    subtitle?: string;
    showDate?: boolean;
    showLocation?: boolean;
    showPaymentButton?: boolean;

    // Style
    overlay?: "none" | "light" | "dark";
    titleAlignment?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export const EventHero = ({
    height = "600px",
    overlayOpacity = 0.5,
    image,
    subtitle,
    showDate = true,
    showLocation = true,
    showPaymentButton = false,
    overlay = "dark",
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

    // Prioridad: Imagen manual (Puck) -> Imagen del evento -> Placeholder
    const actualImage = image || event?.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30";

    // Alignment classes
    const alignmentClass = {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-end text-right'
    }[titleAlignment] || 'items-center text-center';

    // Overlay logic
    const getOverlayStyle = () => {
        if (overlay === 'none') return { backgroundColor: 'transparent', opacity: 0 };
        if (overlay === 'light') return { backgroundColor: '#ffffff', opacity: 0.3 };
        // Default to dark or custom background color
        return {
            backgroundColor: backgroundColor || '#000000',
            opacity: overlayOpacity
        };
    };

    const overlayStyle = getOverlayStyle();

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
                    backgroundColor: overlayStyle.backgroundColor,
                    opacity: overlayStyle.opacity
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

                    {subtitle && (
                        <p
                            className="text-xl md:text-2xl mb-8 opacity-90"
                            style={{ color: textColor || '#ffffff' }}
                        >
                            {subtitle}
                        </p>
                    )}

                    {/* Info Badges (Date & Location) */}
                    <div className="flex flex-wrap gap-4 mb-8 justify-center">
                        {showDate && event?.startDate && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                                <span className="text-sm font-medium">
                                    {new Date(event.startDate).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {showLocation && event?.location && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                                <span className="text-sm font-medium">
                                    {event.location}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Payment Button */}
                    {showPaymentButton && (
                        <button
                            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg"
                        >
                            Comprar Entradas
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};
