import React from 'react';
import { Event } from "@/types/event";
import { Calendar, Clock, MapPin } from "lucide-react";

interface POSEventSelectorProps {
    events: Event[];
    onSelect: (event: Event) => void;
    loading: boolean;
}

export const POSEventSelector: React.FC<POSEventSelectorProps> = ({ events, onSelect, loading }) => {
    if (loading) {
        return (
            <div className="p-6 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 h-full overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Selecciona un evento</h2>
            {events.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No hay eventos activos para venta manual.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map(event => (
                        <div
                            key={event.id}
                            onClick={() => onSelect(event)}
                            className="group border border-gray-300 rounded-lg p-3 hover:border-indigo-600 shadow-md hover:shadow-lg cursor-pointer transition-all bg-white flex flex-col h-full"
                        >
                            <div className={`h-24 rounded-md mb-3 bg-indigo-50 flex items-center justify-center group-hover:scale-[1.02] transition-transform overflow-hidden relative`}>
                                {event.coverImage ? (
                                    <img src={event.coverImage} alt={event.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Calendar className={`text-indigo-600 opacity-70`} size={28} />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 leading-tight mb-1">{event.name}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5"><Clock size={10} /> {new Date(event.date).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} /> {event.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
