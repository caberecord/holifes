import React, { useState } from 'react';
import { Event } from "@/types/event";
import { Plus, Minus, MapPin, Armchair } from 'lucide-react';
import { SeatSelectionModal } from './SeatSelectionModal';
import { TicketZone } from "@/store/eventWizardStore";

interface POSCartProps {
    selectedEvent: Event;
    cart: { [key: string]: number };
    soldByZone: { [key: string]: number };
    onAddToCart: (zoneName: string, delta: number) => void;
    onNext: () => void;
    selectedSeats: { [zoneName: string]: string[] };
    onSelectSeats: (zoneName: string, seats: string[]) => void;
}

export const POSCart: React.FC<POSCartProps> = ({
    selectedEvent,
    cart,
    soldByZone,
    onAddToCart,
    onNext,
    selectedSeats,
    onSelectSeats
}) => {
    const [modalZone, setModalZone] = useState<string | null>(null);
    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    const getSoldSeats = (zoneName: string) => {
        // 1. Use real-time soldSeats if available (preferred)
        if (selectedEvent.soldSeats && selectedEvent.soldSeats.length > 0) {
            return selectedEvent.soldSeats;
        }

        // 2. Fallback to legacy uploadedGuests
        if (!selectedEvent?.distribution?.uploadedGuests) return [];
        return selectedEvent.distribution.uploadedGuests
            .filter(g => g.Status !== 'cancelled' && g.Status !== 'deleted' && g.Seat)
            .map(g => `${g.Zone}:${g.Seat}`);
    };

    type Zone = NonNullable<NonNullable<Event['venue']>['zones']>[number];

    return (
        <div className="flex flex-col h-full animate-slide-in">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Entradas para {selectedEvent.name}</h2>
                <p className="text-xs text-gray-500">Selecciona la cantidad por tipo</p>
            </div>
            <div className="flex-1 p-5 space-y-3 overflow-y-auto">
                {(selectedEvent.venue?.zones || []).map((zone: Zone) => {
                    const quantity = cart[zone.name] || 0;
                    const isNumbered = zone.type === 'seating' || zone.type === 'numbered';
                    const zoneName = zone?.name || '';
                    const zoneSelectedSeats = (selectedSeats && selectedSeats[zoneName]) ? selectedSeats[zoneName] : [];

                    return (
                        <div key={zone.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900">{zone.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        ${zone.price.toLocaleString()} • Disp: {zone.capacity - (soldByZone[zone.name] || 0)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                {isNumbered ? (
                                    <div className="flex-1">
                                        <button
                                            onClick={() => setModalZone(zone.name)}
                                            className="w-full py-2 px-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Armchair className="w-4 h-4" />
                                            {zoneSelectedSeats.length > 0
                                                ? `${zoneSelectedSeats.length} Seleccionados`
                                                : "Seleccionar Asientos"}
                                        </button>
                                        {zoneSelectedSeats.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1 truncate px-1">
                                                {zoneSelectedSeats.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex-1"></div>
                                )}

                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                    <button
                                        onClick={() => onAddToCart(zone.name, -1)}
                                        disabled={quantity === 0}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-red-500 disabled:opacity-50 transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => {
                                            if (isNumbered) {
                                                setModalZone(zone.name);
                                            } else {
                                                onAddToCart(zone.name, 1);
                                            }
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50">
                <button
                    onClick={onNext}
                    disabled={totalItems === 0}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Continuar ({totalItems})
                </button>
            </div>

            {modalZone && (
                <SeatSelectionModal
                    isOpen={!!modalZone}
                    onClose={() => setModalZone(null)}
                    event={selectedEvent}
                    zoneName={modalZone}
                    selectedSeats={selectedSeats[modalZone] || []}
                    onSelectSeats={(seats) => onSelectSeats(modalZone, seats)}
                    soldSeats={getSoldSeats(modalZone)}
                />
            )}
        </div>
    );
};
