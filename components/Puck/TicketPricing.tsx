'use client';

import { useState } from 'react';
import { useEventContext } from '../../lib/context/EventContext';
import { Ticket } from 'lucide-react';
import { CheckoutModal } from '../Public/Checkout/CheckoutModal';

interface TicketPricingProps {
    title?: string;
    showRemaining: boolean;
    lowStockThreshold: number;
    showBuyButton?: boolean;
    buyButtonText?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export function TicketPricing({
    title,
    showRemaining = true,
    lowStockThreshold = 10,
    showBuyButton = false,
    buyButtonText = "Comprar Entradas",
    backgroundColor,
    textColor,
    fontFamily = "inter"
}: TicketPricingProps) {
    const event = useEventContext();
    const [selectedZone, setSelectedZone] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleBuyClick = (zone: any) => {
        setSelectedZone(zone);
        setIsModalOpen(true);
    };

    const zones = event?.venue?.zones || [];
    const uploadedGuests = event?.distribution?.uploadedGuests || [];

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
        harlow: 'font-harlow',
        curlz: 'font-curlz',
        baguet: 'font-baguet',
        cascadia: 'font-cascadia',
        varsity: 'font-varsity',
        freshman: 'font-freshman',
        // Fallbacks
        modern: 'font-inter',
        bold: 'font-anton',
        retro: 'font-space',
    }[fontFamily] || 'font-inter';

    if (zones.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No hay zonas de precios configuradas para este evento.</p>
            </div>
        );
    }

    return (
        <section
            className={`py-16 px-4 ${fontClass}`}
            style={{
                backgroundColor: backgroundColor || '#F3F4F6',
                color: textColor || '#111827'
            }}
        >
            <div className="max-w-5xl mx-auto">
                {title && (
                    <h2
                        className="text-3xl font-bold text-center mb-12"
                        style={{ color: textColor || '#111827' }}
                    >
                        {title}
                    </h2>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    {zones.map((zone, index) => {
                        // Calculate remaining tickets
                        const soldCount = event?.stats?.soldByZone?.[zone.name] ?? uploadedGuests.filter(g => g.Zone === zone.name).length;
                        const remaining = zone.capacity - soldCount;
                        const isLowStock = remaining <= lowStockThreshold && remaining > 0;
                        const isSoldOut = remaining <= 0;

                        return (
                            <div
                                key={index}
                                className="relative flex flex-col bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300"
                                style={{
                                    backgroundColor: backgroundColor ? 'rgba(255,255,255,0.9)' : 'white',
                                }}
                            >
                                <div className="flex flex-1">
                                    {/* Left Side (Main Info) */}
                                    <div className="flex-1 p-6 flex flex-col justify-between relative border-r border-dashed border-gray-300">
                                        {/* Cutout circles for ticket effect */}
                                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#F3F4F6] rounded-full" style={{ backgroundColor: backgroundColor || '#F3F4F6' }}></div>
                                        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#F3F4F6] rounded-full" style={{ backgroundColor: backgroundColor || '#F3F4F6' }}></div>

                                        <div>
                                            <h3
                                                className="text-2xl font-bold mb-2 uppercase tracking-wide"
                                                style={{ color: textColor || '#111827' }}
                                            >
                                                {zone.name}
                                            </h3>
                                            <p className="text-gray-500 text-sm mb-4" style={{ color: textColor ? `${textColor}99` : '#6B7280' }}>
                                                Acceso General
                                            </p>
                                        </div>

                                        <div className="mt-4">
                                            <span
                                                className="text-4xl font-bold text-indigo-600"
                                                style={{ color: textColor || '#4F46E5' }}
                                            >
                                                ${zone.price.toLocaleString()}
                                            </span>
                                        </div>

                                        {showRemaining && (
                                            <div className="mt-4">
                                                {isSoldOut ? (
                                                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase">
                                                        Agotado
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full uppercase animate-pulse">
                                                        ¡Últimos {remaining} boletos!
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-500" style={{ color: textColor ? `${textColor}80` : '#6B7280' }}>
                                                        Disponibles
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Side (Stub) */}
                                    <div className="w-24 bg-gray-50 flex flex-col items-center justify-center p-2 border-l border-dashed border-gray-300 relative">
                                        {/* Cutout circles for ticket effect */}
                                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#F3F4F6] rounded-full" style={{ backgroundColor: backgroundColor || '#F3F4F6' }}></div>
                                        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#F3F4F6] rounded-full" style={{ backgroundColor: backgroundColor || '#F3F4F6' }}></div>

                                        <div className="transform -rotate-90 whitespace-nowrap">
                                            <span className="text-xs font-mono text-gray-400 tracking-widest">ADMIT ONE</span>
                                        </div>
                                        <div className="mt-4">
                                            <Ticket className="w-8 h-8 text-gray-300" />
                                        </div>
                                    </div>
                                </div>

                                {/* Buy Button Section */}
                                {showBuyButton && !isSoldOut && (
                                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                                        <button
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-md"
                                            onClick={() => handleBuyClick(zone)}
                                        >
                                            {buyButtonText}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedZone && event && (
                <CheckoutModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    zoneName={selectedZone.name}
                    price={selectedZone.price}
                    currency={event.currency || 'USD'}
                    tenantId={event.organizerId} // Assuming organizerId is the tenantId
                    connectedAccountId={event.organizerId} // This should ideally be the Stripe Account ID, but using organizerId for now as placeholder or if mapped
                />
            )}
        </section>
    );
}
