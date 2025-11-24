"use client";
import { useVenueBuilderStore, ToolType } from "@/store/venueBuilderStore";
import { MousePointer2, Square, Circle, Type, Grid3X3, Undo, Redo, Box, DoorOpen } from "lucide-react";

export default function Toolbox() {
    const { tool, setTool } = useVenueBuilderStore();

    const tools = [
        { id: 'select', icon: MousePointer2, label: 'Seleccionar' },
        { id: 'rectangle', icon: Square, label: 'Zona General' },
        { id: 'seat-matrix', icon: Grid3X3, label: 'Asientos Numerados' },
        { id: 'circle', icon: Circle, label: 'Decoración' },
        { id: 'text', icon: Type, label: 'Texto' },
        { id: 'stage', icon: Box, label: 'Escenario' },
        { id: 'door', icon: DoorOpen, label: 'Puerta' },
    ];

    return (
        <div className="absolute left-4 top-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-200 flex flex-col gap-2 z-10">
            {tools.map((t) => (
                <button
                    key={t.id}
                    onClick={() => setTool(t.id as ToolType)}
                    className={`p-3 rounded-lg transition-all duration-200 group relative ${tool === t.id
                        ? "bg-indigo-100 text-indigo-600 shadow-inner"
                        : "hover:bg-gray-100 text-gray-600"
                        }`}
                    title={t.label}
                >
                    <t.icon className="w-5 h-5" />

                    {/* Tooltip */}
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-20">
                        {t.label}
                    </span>
                </button>
            ))}

            <div className="h-px bg-gray-200 my-1" />

            <button className="p-3 rounded-lg hover:bg-gray-100 text-gray-600 opacity-50 cursor-not-allowed" title="Deshacer (Próximamente)">
                <Undo className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-lg hover:bg-gray-100 text-gray-600 opacity-50 cursor-not-allowed" title="Rehacer (Próximamente)">
                <Redo className="w-5 h-5" />
            </button>
        </div>
    );
}
