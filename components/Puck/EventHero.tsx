'use client';

import { useEventContext } from '../../lib/context/EventContext';
import { Calendar, MapPin } from 'lucide-react';

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

    // Date formatting
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Use event date, fallback only if event is missing (e.g. editor preview without context)
    // If event exists but has no date, show "Fecha por definir"
    // If event is undefined (editor), show a placeholder date ONLY if we want to preview it, 
    // but user requested to show DB date. 
    // Logic: If event.startDate exists, use it. If not, show "Fecha por definir".
    const displayDate = event?.startDate ? formatDate(event.startDate) : "Fecha por definir";

    // Layout Content Components
    const TitleSection = () => (
        <div className="flex flex-col gap-4">
            <h1
                className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight ${fontClass} uppercase`}
                style={{ color: textColor || '#ffffff', lineHeight: 0.9 }}
            >
                {actualTitle}
            </h1>
            {subtitle && (
                <p
                    className="text-xl md:text-2xl font-medium opacity-90"
                    style={{ color: textColor || '#ffffff' }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );

    const InfoSection = () => (
        <div className={`flex flex-col gap-6 ${titleAlignment === 'center' ? 'items-center' : titleAlignment === 'right' ? 'items-start' : 'items-start'}`}>
            {/* Payment Button */}
            {showPaymentButton && (
                <button
                    className="px-8 py-3 bg-[#634cc9] hover:bg-[#523da8] text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg uppercase tracking-wide text-sm mb-2"
                >
                    Comprar Entradas
                </button>
            )}

            <div className="flex flex-col gap-3">
                {showLocation && (
                    <div className="flex items-center gap-3 text-white">
                        <MapPin className="text-red-500" size={28} />
                        <span className="text-xl font-bold" style={{ color: textColor || '#ffffff' }}>
                            {event?.location || "Ubicación del Evento"}
                        </span>
                    </div>
                )}

                {showDate && (
                    <div className="flex items-center gap-3 text-white">
                        <Calendar className="text-white" size={28} />
                        <span className="text-xl font-bold" style={{ color: textColor || '#ffffff' }}>
                            {displayDate}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

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

            {/* Content Container with Pronounced Margins */}
            <div className="relative h-full max-w-7xl mx-auto px-8 md:px-32 lg:px-48 flex flex-col justify-center">

                {/* Center Layout */}
                {titleAlignment === 'center' && (
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto w-full gap-12">
                        <TitleSection />
                        <InfoSection />
                    </div>
                )}

                {/* Left Layout (Split: Title Left, Info Right) */}
                {titleAlignment === 'left' && (
                    <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
                        <div className="w-full md:w-1/2 text-left">
                            <TitleSection />
                        </div>
                        <div className="w-full md:w-1/2 flex justify-end">
                            <InfoSection />
                        </div>
                    </div>
                )}

                {/* Right Layout (Split: Info Left, Title Right) */}
                {titleAlignment === 'right' && (
                    <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
                        <div className="w-full md:w-1/2 flex justify-start">
                            <InfoSection />
                        </div>
                        <div className="w-full md:w-1/2 text-right">
                            <TitleSection />
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
};
