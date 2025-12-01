"use client";
import dynamic from 'next/dynamic';
import Toolbox from './Toolbox';
import { useVenueBuilderStore, AllocatableUnit } from '@/store/venueBuilderStore';
import PropertiesPanel from './PropertiesPanel';
import PreviewModal from './PreviewModal';

// Dynamically import Canvas to avoid SSR issues with Konva
const VenueCanvas = dynamic(() => import('./VenueCanvas'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    ),
});

import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function VenueBuilder() {
    const { elements } = useVenueBuilderStore();

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    // Calculate total capacity dynamically
    const totalCapacity = elements.reduce((total: number, el: AllocatableUnit) => {
        if (el.type === 'general') {
            return total + (el.capacity || 0);
        } else if (el.type === 'numbered') {
            return total + ((el.rows || 0) * (el.cols || 0));
        } else if (el.type === 'stand') {
            return total + 1; // Each stand counts as 1 unit of capacity (or could be 0 if it's just space)
        }
        return total;
    }, 0);

    const sellableZones = elements.filter((el: AllocatableUnit) =>
        ['general', 'numbered', 'stand'].includes(el.type)
    ).length;

    return (
        <div className="flex h-[500px] w-full max-w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm relative">
            {/* Capacity Counter - Bottom Left (Shifted right to avoid Toolbox) */}
            <div className="absolute bottom-4 left-36 z-30 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-3">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">{totalCapacity.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Capacidad Total</div>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                    <div className="text-center">
                        <div className="text-lg font-semibold text-gray-700">{sellableZones}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Zonas</div>
                    </div>
                </div>
            </div>

            {/* Left: Toolbox */}
            <Toolbox />

            {/* Center: Canvas */}
            <div className="flex-1 relative z-0 min-w-0">
                <VenueCanvas />
            </div>

            {/* Right: Properties Panel */}
            <PropertiesPanel />

            {/* Modals */}
            <PreviewModal />
        </div>
    );
}
