import { useVenueBuilderStore, ToolType } from "@/store/venueBuilderStore";
import { MousePointer2, Square, Circle, Type, Grid3X3, Undo, Redo, Box, DoorOpen, Store, Footprints, Moon, Wifi, Flame, Download, Crop } from "lucide-react";


export default function Toolbox() {
    // @ts-ignore - history props are new
    const { tool, setTool, undo, redo, past, future, viewMode, setViewMode, is3DPreviewOpen, toggle3DPreview } = useVenueBuilderStore();

    const handleExport = async () => {
        // Find the stage container
        const stageContainer = document.querySelector('.konvajs-content');
        if (stageContainer) {
            try {
                const html2canvas = (await import('html2canvas')).default;
                const canvas = await html2canvas(stageContainer as HTMLElement);
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'venue-layout.png';
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error('Export failed:', err);
            }
        }
    };

    const tools = [
        { id: 'select', icon: MousePointer2, label: 'Seleccionar' },
        { id: 'crop', icon: Crop, label: 'Ajustar Lienzo' },
        { id: 'stand', icon: Store, label: 'Stand Comercial' },
        { id: 'aisle', icon: Footprints, label: 'Pasillo / Circulación' },
        { id: 'rectangle', icon: Square, label: 'Zona General' },
        { id: 'general-curve', icon: Moon, label: 'Zona Curva' },
        { id: 'seat-matrix', icon: Grid3X3, label: 'Asientos Numerados' },
        { id: 'seat-curve', icon: Wifi, label: 'Asientos Curvos' },
        { id: 'circle', icon: Circle, label: 'Decoración' },
        { id: 'text', icon: Type, label: 'Texto' },
        { id: 'stage', icon: Box, label: 'Escenario' },
        { id: 'door', icon: DoorOpen, label: 'Puerta' },
    ];

    return (
        <div className="absolute left-4 top-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-200 flex flex-col gap-2 z-10 max-h-[80vh] overflow-y-auto scrollbar-hide w-fit">
            <div className="grid grid-cols-2 gap-2">
                {tools.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTool(t.id as ToolType)}
                        className={`p-3 rounded-lg transition-all duration-200 group relative flex items-center justify-center ${tool === t.id
                            ? "bg-indigo-100 text-indigo-600 shadow-inner"
                            : "hover:bg-gray-100 text-gray-600"
                            }`}
                        title={t.label}
                    >
                        <t.icon className="w-5 h-5" />
                    </button>
                ))}

                {/* Export Button (Appended to grid) */}
                <button
                    onClick={handleExport}
                    className="p-3 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors group relative"
                    title="Exportar Imagen"
                >
                    <Download className="w-5 h-5" />
                </button>
            </div>

            <div className="h-px bg-gray-200 my-1" />

            {/* Visualization Controls */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => setViewMode(viewMode === 'heatmap' ? 'normal' : 'heatmap')}
                    className={`p-3 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'heatmap'
                        ? "bg-orange-100 text-orange-600"
                        : "hover:bg-gray-100 text-gray-600"
                        }`}
                    title="Mapa de Calor (Precios)"
                >
                    <Flame className="w-5 h-5" />
                </button>

                <button
                    onClick={toggle3DPreview}
                    className={`p-3 rounded-lg flex items-center justify-center transition-colors ${is3DPreviewOpen
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100 text-gray-600"
                        }`}
                    title="Vista 3D"
                >
                    <Box className="w-5 h-5" />
                </button>
            </div>

            <div className="h-px bg-gray-200 my-1" />

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={undo}
                    disabled={!past || past.length === 0}
                    className={`p-3 rounded-lg flex items-center justify-center transition-colors ${!past || past.length === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-100 text-gray-600"
                        }`}
                    title="Deshacer"
                >
                    <Undo className="w-5 h-5" />
                </button>
                <button
                    onClick={redo}
                    disabled={!future || future.length === 0}
                    className={`p-3 rounded-lg flex items-center justify-center transition-colors ${!future || future.length === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-100 text-gray-600"
                        }`}
                    title="Rehacer"
                >
                    <Redo className="w-5 h-5" />
                </button>
            </div>


        </div>
    );
}
