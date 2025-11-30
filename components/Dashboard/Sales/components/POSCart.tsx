import React from 'react';
import { Event } from "@/types/event";
import { Minus, Plus } from "lucide-react";

interface POSCartProps {
    selectedEvent: Event;
    cart: { [key: string]: number };
    soldByZone: { [key: string]: number };
    onAddToCart: (zoneName: string, delta: number) => void;
    onNext: () => void;
}

export const POSCart: React.FC<POSCartProps> = ({ selectedEvent, cart, soldByZone, onAddToCart, onNext }) => {
    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    return (
        <div className="flex flex-col h-full animate-slide-in">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Entradas para {selectedEvent.name}</h2>
                <p className="text-xs text-gray-500">Selecciona la cantidad por tipo</p>
            </div>
            <div className="flex-1 p-5 space-y-3 overflow-y-auto">
                {selectedEvent.venue?.zones.map(zone => (
                    <div key={zone.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-indigo-100 bg-white transition-colors">
                        <div>
                            <h4 className="font-bold text-sm text-gray-900">{zone.name}</h4>
                            <p className="text-xs text-gray-500">${zone.price.toLocaleString()} • Disp: {zone.capacity - (soldByZone[zone.name] || 0)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                <button
                                    onClick={() => onAddToCart(zone.name, -1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-red-500 disabled:opacity-50 transition-colors"
                                    disabled={!cart[zone.name]}
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-6 text-center font-bold text-sm">{cart[zone.name] || 0}</span>
                                <button
                                    onClick={() => onAddToCart(zone.name, 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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
        </div>
    );
};
