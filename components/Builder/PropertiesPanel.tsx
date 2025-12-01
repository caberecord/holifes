"use client";
import { useVenueBuilderStore, PIXELS_PER_METER, AllocatableUnit } from "@/store/venueBuilderStore";
import { Trash2, X, Merge, Upload, Settings2, ChevronDown, ChevronRight, Lock, Unlock, ArrowUpToLine, ArrowDownToLine, Group, Ungroup } from "lucide-react";
import { useState } from "react";

// Helper for currency formatting
const formatCurrency = (value: number) => {
    // Default to COP for now as requested by user context (Colombia flag)
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

export default function PropertiesPanel() {
    // @ts-ignore - new properties
    const {
        selectedIds,
        elements,
        updateElement,
        removeElements,
        selectElement,
        mergeSelectedStands,
        backgroundImage,
        backgroundScale,
        backgroundOpacity,
        backgroundX,
        backgroundY,
        setBackgroundImage,
        updateBackground,
        toggleLock,
        bringToFront,
        sendToBack,
        groupElements,
        ungroupElements
    } = useVenueBuilderStore();

    // Local state for collapsing the panel
    const [isExpanded, setIsExpanded] = useState(true);

    // Handle Image Upload for Background
    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBackgroundImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Global Settings View (No Selection) ---
    if (selectedIds.length === 0) {
        return (
            <div className="absolute right-4 top-4 w-80 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300">
                <div
                    className="p-4 flex items-center justify-between cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                        <Settings2 className="w-4 h-4" />
                        Configuración del Recinto
                    </h3>
                    <button className="text-gray-500 hover:text-gray-700">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                {isExpanded && (
                    <div className="p-4 pt-0 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Background Image Upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Plano de Fondo (Blueprint)</label>

                            {backgroundImage ? (
                                <div className="relative group">
                                    <img src={backgroundImage} alt="Background" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setBackgroundImage(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBackgroundUpload}
                                        className="hidden"
                                        id="bg-upload"
                                    />
                                    <label htmlFor="bg-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <span className="text-sm text-gray-600">Subir imagen de plano</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {backgroundImage && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Opacidad</label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        value={backgroundOpacity}
                                        onChange={(e) => updateBackground({ opacity: parseFloat(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Escala</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={backgroundScale}
                                        onChange={(e) => updateBackground({ scale: parseFloat(e.target.value) })}
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Pos X</label>
                                        <input
                                            type="number"
                                            value={backgroundX}
                                            onChange={(e) => updateBackground({ x: parseFloat(e.target.value) })}
                                            className="w-full p-2 border rounded-md text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Pos Y</label>
                                        <input
                                            type="number"
                                            value={backgroundY}
                                            onChange={(e) => updateBackground({ y: parseFloat(e.target.value) })}
                                            className="w-full p-2 border rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg">
                            <p className="font-semibold mb-1">💡 Tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Usa las flechas del teclado para mover objetos.</li>
                                <li>Mantén <strong>Shift</strong> para mover más rápido.</li>
                                <li><strong>Ctrl+C</strong> y <strong>Ctrl+V</strong> para copiar/pegar.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- Multi-Selection View ---
    if (selectedIds.length > 1) {
        const selectedCount = selectedIds.length;
        const allStands = elements
            .filter((el: AllocatableUnit) => selectedIds.includes(el.id))
            .every((el: AllocatableUnit) => el.type === 'stand');

        // Check if all selected items are locked
        const allLocked = elements
            .filter((el: AllocatableUnit) => selectedIds.includes(el.id))
            .every((el: AllocatableUnit) => el.locked);

        return (
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl absolute right-0 top-0 bottom-0 z-20">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900">Selección Múltiple</h3>
                    <button onClick={() => selectElement(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 space-y-6">
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <div className="text-2xl font-bold text-indigo-600 mb-1">{selectedCount}</div>
                        <div className="text-sm text-gray-500">Elementos seleccionados</div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => toggleLock(selectedIds)}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${allLocked ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {allLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            {allLocked ? 'Desbloquear' : 'Bloquear'}
                        </button>

                        <button
                            onClick={() => groupElements(selectedIds)}
                            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Group className="w-4 h-4" />
                            Agrupar
                        </button>

                        <button
                            onClick={() => bringToFront(selectedIds)}
                            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            title="Traer al frente"
                        >
                            <ArrowUpToLine className="w-4 h-4" />
                            Al Frente
                        </button>

                        <button
                            onClick={() => sendToBack(selectedIds)}
                            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            title="Enviar al fondo"
                        >
                            <ArrowDownToLine className="w-4 h-4" />
                            Al Fondo
                        </button>
                    </div>

                    {allStands && (
                        <button
                            onClick={mergeSelectedStands}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-colors font-medium shadow-sm"
                        >
                            <Merge className="w-4 h-4" />
                            Fusionar Stands
                        </button>
                    )}

                    <button
                        onClick={() => removeElements(selectedIds)}
                        className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Todo ({selectedCount})
                    </button>
                </div>
            </div>
        );
    }

    // --- Single Selection View ---
    const selectedElement = elements.find((el: AllocatableUnit) => el.id === selectedIds[0]);
    if (!selectedElement) return null;

    const handleChange = (field: string, value: any) => {
        updateElement(selectedElement.id, { [field]: value });
    };

    const handleMetadataChange = (field: string, value: any) => {
        updateElement(selectedElement.id, {
            metadata: {
                ...selectedElement.metadata,
                [field]: value
            } as any
        });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // @ts-ignore
                handleMetadataChange('logo', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Size in meters
    const widthMeters = (selectedElement.width / PIXELS_PER_METER).toFixed(2);
    const heightMeters = (selectedElement.height / PIXELS_PER_METER).toFixed(2);
    const radiusMeters = ((selectedElement.curveRadius || 0) / PIXELS_PER_METER).toFixed(2);

    const handleSizeChange = (dim: 'width' | 'height' | 'curveRadius', meters: string) => {
        const val = parseFloat(meters);
        if (!isNaN(val) && val > 0) {
            handleChange(dim, val * PIXELS_PER_METER);
        }
    };

    const handleNamingSchemeChange = (type: 'rowType' | 'seatType', value: string) => {
        updateElement(selectedElement.id, {
            namingScheme: {
                rowType: selectedElement.namingScheme?.rowType || 'alpha',
                seatType: selectedElement.namingScheme?.seatType || 'numeric',
                [type]: value
            }
        });
    };

    return (
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl absolute right-0 top-0 bottom-0 z-20">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900">Propiedades</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => toggleLock([selectedElement.id])}
                        className={`p-1 rounded hover:bg-gray-100 ${selectedElement.locked ? 'text-red-500' : 'text-gray-400'}`}
                        title={selectedElement.locked ? "Desbloquear" : "Bloquear"}
                    >
                        {selectedElement.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button onClick={() => selectElement(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* Actions Row */}
                <div className="flex gap-2 justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => bringToFront([selectedElement.id])}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                            title="Traer al frente"
                        >
                            <ArrowUpToLine className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => sendToBack([selectedElement.id])}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                            title="Enviar al fondo"
                        >
                            <ArrowDownToLine className="w-4 h-4" />
                        </button>
                    </div>

                    {selectedElement.groupId && (
                        <button
                            onClick={() => ungroupElements([selectedElement.id])}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
                        >
                            <Ungroup className="w-3 h-3" />
                            Desagrupar
                        </button>
                    )}
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Nombre / Etiqueta</label>
                        <input
                            type="text"
                            value={selectedElement.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            disabled={selectedElement.locked}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Color Fondo</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={selectedElement.fill}
                                    onChange={(e) => handleChange('fill', e.target.value)}
                                    disabled={selectedElement.locked}
                                    className="h-9 w-full rounded cursor-pointer border border-gray-300 p-1 disabled:opacity-50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tipo</label>
                            <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 capitalize font-medium truncate">
                                {selectedElement.type === 'general' ? 'General' :
                                    selectedElement.type === 'numbered' ? 'Numerada' :
                                        selectedElement.type === 'decoration' ? 'Decoración' :
                                            selectedElement.type === 'stage' ? 'Escenario' :
                                                selectedElement.type === 'stand' ? 'Stand' :
                                                    selectedElement.type === 'aisle' ? 'Pasillo' :
                                                        selectedElement.type === 'door' ? 'Puerta' : 'Texto'}
                            </div>
                        </div>
                    </div>

                    {/* Font Color for Text and Stand */}
                    {(selectedElement.type === 'text' || selectedElement.type === 'stand') && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Color Texto</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={selectedElement.textColor || '#000000'}
                                    onChange={(e) => handleChange('textColor', e.target.value)}
                                    disabled={selectedElement.locked}
                                    className="h-9 w-full rounded cursor-pointer border border-gray-300 p-1 disabled:opacity-50"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <hr className="border-gray-100" />

                {/* Manual Size Inputs (General & Numbered) */}
                {(selectedElement.type === 'general' || selectedElement.type === 'numbered') && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm">Dimensiones</h4>

                        {selectedElement.shape === 'curve' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Radio (m)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={radiusMeters}
                                        onChange={(e) => handleSizeChange('curveRadius', e.target.value)}
                                        disabled={selectedElement.locked}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Ángulo (°)</label>
                                    <input
                                        type="number"
                                        value={selectedElement.curveAngle || 180}
                                        onChange={(e) => handleChange('curveAngle', parseFloat(e.target.value))}
                                        disabled={selectedElement.locked}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Ancho (m)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={widthMeters}
                                        onChange={(e) => handleSizeChange('width', e.target.value)}
                                        disabled={selectedElement.locked}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Largo (m)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={heightMeters}
                                        onChange={(e) => handleSizeChange('height', e.target.value)}
                                        disabled={selectedElement.locked}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Stand Configuration */}
                {selectedElement.type === 'stand' && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm">Configuración de Stand</h4>

                        {/* Size (Meters) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Ancho (m)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={widthMeters}
                                    onChange={(e) => handleSizeChange('width', e.target.value)}
                                    disabled={selectedElement.locked}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Largo (m)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={heightMeters}
                                    onChange={(e) => handleSizeChange('height', e.target.value)}
                                    disabled={selectedElement.locked}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Estado</label>
                            <select
                                value={selectedElement.metadata?.status || 'available'}
                                onChange={(e) => handleMetadataChange('status', e.target.value)}
                                disabled={selectedElement.locked}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                            >
                                <option value="available">Disponible</option>
                                <option value="reserved">Reservado</option>
                                <option value="sold">Vendido</option>
                                <option value="blocked">Bloqueado</option>
                            </select>
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Logo de Marca</label>
                            <div className="flex flex-col gap-2">
                                <label className={`flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedElement.locked ? 'pointer-events-none opacity-50' : ''}`}>
                                    {selectedElement.metadata?.logo ? (
                                        <img src={selectedElement.metadata.logo} alt="Logo" className="h-full object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-500">Subir Imagen</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={selectedElement.locked} />
                                </label>
                                {selectedElement.metadata?.logo && !selectedElement.locked && (
                                    <button
                                        onClick={() => handleMetadataChange('logo', null)}
                                        className="text-xs text-red-500 hover:text-red-700 text-center"
                                    >
                                        Eliminar Logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Decoration Shape Selector */}
                {selectedElement.type === 'decoration' && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm">Configuración de Forma</h4>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Forma</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['rectangle', 'circle', 'T', 'L'] as const).map((shape) => (
                                    <button
                                        key={shape}
                                        onClick={() => handleChange('shape', shape)}
                                        disabled={selectedElement.locked}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${(selectedElement.shape || 'circle') === shape
                                            ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-500'
                                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            } ${selectedElement.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {shape === 'rectangle' ? 'Rectángulo' : shape === 'circle' ? 'Círculo' : shape}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage Shape Selector */}
                {selectedElement.type === 'stage' && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm">Forma del Escenario</h4>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Forma</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['rectangle', 'circle'] as const).map((shape) => (
                                    <button
                                        key={shape}
                                        onClick={() => handleChange('shape', shape)}
                                        disabled={selectedElement.locked}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${(selectedElement.shape || 'rectangle') === shape
                                            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            } ${selectedElement.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {shape === 'rectangle' ? 'Rectangular' : 'Circular'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Business Logic */}
                {(selectedElement.type === 'general' || selectedElement.type === 'numbered' || selectedElement.type === 'stand') && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm">Configuración de Venta</h4>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Precio</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={selectedElement.price}
                                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                                    disabled={selectedElement.locked}
                                    className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-right">
                                {formatCurrency(selectedElement.price)}
                            </p>
                        </div>

                        {selectedElement.type === 'general' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Capacidad Total</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={selectedElement.capacity}
                                    onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                                    disabled={selectedElement.locked}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                                />
                            </div>
                        )}

                        {selectedElement.type === 'numbered' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Filas</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={selectedElement.rows || 5}
                                            onChange={(e) => handleChange('rows', parseInt(e.target.value) || 1)}
                                            disabled={selectedElement.locked}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Columnas</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={selectedElement.cols || 10}
                                            onChange={(e) => handleChange('cols', parseInt(e.target.value) || 1)}
                                            disabled={selectedElement.locked}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                                        />
                                    </div>
                                </div>

                                {/* Naming Scheme Configuration */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Numeración</label>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="block text-gray-400 mb-1">Filas</span>
                                            <select
                                                value={selectedElement.namingScheme?.rowType || 'alpha'}
                                                onChange={(e) => handleNamingSchemeChange('rowType', e.target.value)}
                                                disabled={selectedElement.locked}
                                                className="w-full border border-gray-300 rounded p-1 disabled:bg-gray-100"
                                            >
                                                <option value="alpha">A, B, C...</option>
                                                <option value="numeric">1, 2, 3...</option>
                                            </select>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 mb-1">Asientos</span>
                                            <select
                                                value={selectedElement.namingScheme?.seatType || 'numeric'}
                                                onChange={(e) => handleNamingSchemeChange('seatType', e.target.value)}
                                                disabled={selectedElement.locked}
                                                className="w-full border border-gray-300 rounded p-1 disabled:bg-gray-100"
                                            >
                                                <option value="numeric">1, 2, 3...</option>
                                                <option value="alpha">A, B, C...</option>
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Ej: Fila {selectedElement.namingScheme?.rowType === 'numeric' ? '1' : 'A'}, Asiento {selectedElement.namingScheme?.seatType === 'alpha' ? 'A' : '1'}
                                    </p>
                                </div>

                                <div className="col-span-2 text-xs text-gray-500 bg-blue-50 p-2 rounded text-center">
                                    Total Asientos: {(selectedElement.rows || 0) * (selectedElement.cols || 0)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {selectedElement.type === 'text' && (
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Contenido</label>
                        <input
                            type="text"
                            value={selectedElement.text}
                            onChange={(e) => handleChange('text', e.target.value)}
                            disabled={selectedElement.locked}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                        />
                        <div className="mt-4">
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tamaño Fuente</label>
                            <input
                                type="number"
                                value={selectedElement.fontSize}
                                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                disabled={selectedElement.locked}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                )}

                <div className="pt-6 mt-auto">
                    <button
                        onClick={() => removeElements([selectedElement.id])}
                        disabled={selectedElement.locked}
                        className={`w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${selectedElement.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Elemento
                    </button>
                </div>
            </div>
        </div>
    );
}
