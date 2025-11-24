"use client";
import { useVenueBuilderStore } from "@/store/venueBuilderStore";
import { Trash2, X } from "lucide-react";

export default function PropertiesPanel() {
    const { selectedId, elements, updateElement, removeElement, selectElement } = useVenueBuilderStore();
    const selectedElement = elements.find(el => el.id === selectedId);

    if (!selectedElement) return null;

    const handleChange = (field: string, value: any) => {
        updateElement(selectedElement.id, { [field]: value });
    };

    return (
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl absolute right-0 top-0 bottom-0 z-20">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900">Propiedades</h3>
                <button onClick={() => selectElement(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Nombre</label>
                        <input
                            type="text"
                            value={selectedElement.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Color</label>
                            <input
                                type="color"
                                value={selectedElement.fill}
                                onChange={(e) => handleChange('fill', e.target.value)}
                                className="h-9 w-full rounded cursor-pointer border border-gray-300 p-1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tipo</label>
                            <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 capitalize font-medium">
                                {selectedElement.type === 'general' ? 'General' :
                                    selectedElement.type === 'numbered' ? 'Numerada' :
                                        selectedElement.type === 'decoration' ? 'Decoración' :
                                            selectedElement.type === 'stage' ? 'Escenario' :
                                                selectedElement.type === 'door' ? 'Puerta' : 'Texto'}
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

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
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${(selectedElement.shape || 'circle') === shape
                                                ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-500'
                                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
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
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${(selectedElement.shape || 'rectangle') === shape
                                                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                    >
                                        {shape === 'rectangle' ? 'Rectangular' : 'Circular'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Business Logic */}
                {(selectedElement.type === 'general' || selectedElement.type === 'numbered') && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm">Configuración de Venta</h4>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Precio (USD)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={selectedElement.price}
                                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {selectedElement.type === 'general' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Capacidad Total</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={selectedElement.capacity}
                                    onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        )}

                        {selectedElement.type === 'numbered' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Filas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={selectedElement.rows || 5}
                                        onChange={(e) => handleChange('rows', parseInt(e.target.value) || 1)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
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
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <div className="mt-4">
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tamaño Fuente</label>
                            <input
                                type="number"
                                value={selectedElement.fontSize}
                                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                )}

                <div className="pt-6 mt-auto">
                    <button
                        onClick={() => removeElement(selectedElement.id)}
                        className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Elemento
                    </button>
                </div>
            </div>
        </div>
    );
}
