'use client';

import { useEventContext } from '../../lib/context/EventContext';

interface EventHeroProps {
    image?: string;
    subtitle?: string;
    showDate: boolean;
    showLocation: boolean;
    ctaLink?: string;
    showPaymentButton?: boolean;
    overlay: "none" | "light" | "dark";
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export function EventHero({
    image,
    subtitle,
    showDate,
    showLocation,
    ctaLink,
    showPaymentButton,
    overlay,
    backgroundColor,
    textColor,
    fontFamily = "inter"
}: EventHeroProps) {
    const event = useEventContext();

    const actualTitle = event?.name || "Nombre del Evento";
    const actualDate = event?.date;
    const actualLocation = event?.location;
    const actualImage = image || event?.imageUrl;

    let formattedDate = '';
    if (showDate && actualDate) {
        try {
            const dateObj = new Date(actualDate);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        } catch (e) {
            console.error("Error parsing event date:", e);
        }
    }

    const overlayClass = {
        none: '',
        light: 'bg-white/30',
        dark: 'bg-black/50'
    }[overlay];

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

    const handlePaymentClick = () => {
        alert("Iniciando proceso de pago... (Próximamente)");
    };

    return (
        <section
            className={`relative h-[600px] flex items-center justify-center overflow-hidden ${fontClass}`}
            style={{
                backgroundColor: backgroundColor || 'transparent',
                color: textColor || 'white'
            }}
        >
            {/* Background Image */}
            {actualImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${actualImage})` }}
                />
            )}

            {/* Overlay */}
            {overlay !== 'none' && (
                <div className={`absolute inset-0 ${overlayClass}`} />
            )}

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg" style={{ color: textColor || 'white' }}>
                    {actualTitle}
                </h1>

                {subtitle && (
                    <p className="text-xl md:text-2xl mb-8 drop-shadow" style={{ color: textColor ? `${textColor}E6` : 'rgba(255,255,255,0.9)' }}>
                        {subtitle}
                    </p>
                )}

                {/* Date and Location */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8" style={{ color: textColor || 'white' }}>
                    {formattedDate && (
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-lg capitalize">{formattedDate}</span>
                        </div>
                    )}

                    {showLocation && actualLocation && (
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-lg">{actualLocation}</span>
                        </div>
                    )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                    {showPaymentButton && (
                        <button
                            onClick={handlePaymentClick}
                            className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Comprar Ahora
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
