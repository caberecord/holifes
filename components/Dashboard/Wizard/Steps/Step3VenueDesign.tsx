"use client";
import { useEffect } from "react";
import { useEventWizardStore } from "@/store/eventWizardStore";
import VenueBuilder from "@/components/Builder/VenueBuilder";
import { useVenueBuilderStore } from "@/store/venueBuilderStore";
import type { TicketZone } from "@/store/eventWizardStore";

export default function Step3VenueDesign() {
    const { setStep, venue, setVenueMap, updateZones } = useEventWizardStore();
    const { elements, stageConfig, loadElements, setStageConfig } = useVenueBuilderStore();

    // Load existing data on mount
    useEffect(() => {
        if (venue.venueMap) {
            loadElements(venue.venueMap.elements || []);
            if (venue.venueMap.stageConfig) {
                setStageConfig(venue.venueMap.stageConfig);
            }
        }
    }, []);

    const handleContinue = () => {
        // Validation
        const sellableZones = elements.filter(el => el.type === 'general' || el.type === 'numbered');

        if (sellableZones.length === 0) {
            alert('⚠️ Debes agregar al menos una zona de venta (Rectángulo o Asientos)');
            return;
        }

        // Validate all zones have valid data
        const invalidZones = sellableZones.filter(el =>
            !el.name ||
            el.price <= 0 ||
            (el.type === 'general' && (!el.capacity || el.capacity <= 0)) ||
            (el.type === 'numbered' && (!el.rows || !el.cols || el.rows <= 0 || el.cols <= 0))
        );

        if (invalidZones.length > 0) {
            alert(`⚠️ ${invalidZones.length} zona(s) tienen datos incompletos.\n\nVerifica que todas las zonas tengan:\n• Nombre\n• Precio mayor a 0\n• Capacidad o Filas/Columnas válidas`);
            return;
        }

        // 1. Save raw builder state
        const venueMap = {
            elements,
            stageConfig
        };
        setVenueMap(venueMap);

        // 2. Map to TicketZones for backend logic
        const zones: TicketZone[] = sellableZones.map(el => ({
            id: el.id,
            name: el.name,
            capacity: el.type === 'numbered'
                ? (el.rows || 0) * (el.cols || 0)
                : (el.capacity || 0),
            price: el.price,
            color: el.fill,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            rotation: el.rotation,
            type: el.type === 'numbered' ? 'seating' : 'standing',
            shape: 'rectangle' // Default for now
        }));

        updateZones(zones);
        setStep(4);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Diseño del Escenario</h2>
                    <p className="text-gray-500">Selecciona una herramienta y haz clic en el lienzo para añadir elementos.</p>
                </div>
                <div className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-medium">
                    Beta: Editor Visual
                </div>
            </div>

            <VenueBuilder />

            <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
                <button
                    onClick={() => setStep(2)}
                    className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                    Atrás
                </button>
                <button
                    onClick={handleContinue}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-lg transition-colors font-medium"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}
