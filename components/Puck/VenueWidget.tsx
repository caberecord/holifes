'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useVenueBuilderStore } from '../../store/venueBuilderStore';
import { useEventContext } from '../../lib/context/EventContext';

// Importar Canvas dinámicamente
const VenueCanvas = dynamic(() => import('../Builder/VenueCanvas'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    ),
});

export function VenueWidget() {
    const { loadElements, setTool } = useVenueBuilderStore();
    const eventData = useEventContext();

    useEffect(() => {
        // @ts-ignore - venue_layout might be legacy or mapped from venueMap
        const layout = eventData?.venue_layout || eventData?.venue?.venueMap;

        if (layout) {
            // Cargar elementos del layout del evento
            loadElements(layout.elements || []);
            // Forzar herramienta de selección para evitar ediciones accidentales
            setTool('select');
        }
    }, [eventData, loadElements, setTool]);

    // @ts-ignore
    if (!eventData?.venue_layout && !eventData?.venue?.venueMap) {
        return (
            <div className="w-full h-[400px] bg-gray-100 flex flex-col items-center justify-center text-gray-500 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Mapa de Asientos no configurado</h3>
                <p className="text-sm">Configura el escenario en la sección "Constructor de Escenarios" para verlo aquí.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Mapa del Evento</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        {/* @ts-ignore */}
                        {(eventData.venue_layout || eventData.venue?.venueMap)?.elements?.length || 0} Elementos
                    </span>
                </div>
                <div className="h-[500px] w-full relative">
                    <VenueCanvas />
                </div>
            </div>
        </div>
    );
}
