"use client";
import { VenueType, TicketZone } from "@/store/eventWizardStore";
import { useState, useRef } from "react";
import { Plus, Trash2, Move, RotateCw, Armchair, Box } from "lucide-react";

const templates = [
    { id: "auditorium" as VenueType, name: "Auditorio", icon: "🏛️" },
    { id: "concert-hall" as VenueType, name: "Sala de Conciertos", icon: "🎵" },
    { id: "open-field" as VenueType, name: "Campo Abierto", icon: "🌳" },
    { id: "theater" as VenueType, name: "Teatro", icon: "🎭" },
];

interface VenueDesignerProps {
    venue: {
        type: VenueType | null;
        zones: TicketZone[];
        totalCapacity: number;
    };
    onChange: (newVenue: { type: VenueType | null; zones: TicketZone[]; totalCapacity: number }) => void;
}

export default function VenueDesigner({ venue, onChange }: VenueDesignerProps) {
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

    const updateZones = (newZones: TicketZone[]) => {
        onChange({
            ...venue,
            zones: newZones,
            totalCapacity: newZones.reduce((acc, z) => acc + z.capacity, 0),
        });
    };

    const updateZonePosition = (id: string, x: number, y: number) => {
        const newZones = venue.zones.map((z) => (z.id === id ? { ...z, x, y } : z));
        updateZones(newZones);
    };

    const setVenueType = (type: VenueType) => {
        // If changing type, maybe reset zones or keep them? 
        // For now, let's just update type. If it's the first time, add default zones.
        let newZones = venue.zones;
        if (venue.zones.length === 0) {
            newZones = [
                { id: "1", name: "General", capacity: 100, price: 0, color: "#4f46e5", x: 50, y: 100, width: 200, height: 100, type: 'standing', shape: 'rectangle', rotation: 0 },
                { id: "2", name: "VIP", capacity: 20, price: 50, color: "#9333ea", x: 300, y: 100, width: 150, height: 80, type: 'seating', shape: 'rectangle', rotation: 0 },
            ];
        }
        onChange({ ...venue, type, zones: newZones, totalCapacity: newZones.reduce((acc, z) => acc + z.capacity, 0) });
    };

    const handleAddZone = () => {
        const newZone: TicketZone = {
            id: Math.random().toString(36).substr(2, 9),
            name: "Nueva Zona",
            capacity: 50,
            price: 0,
            color: "#10b981",
            x: 100,
            y: 200,
            width: 150,
            height: 100,
            type: 'standing',
            shape: 'rectangle',
            rotation: 0
        };
        updateZones([...venue.zones, newZone]);
    };

    const handleRemoveZone = (id: string) => {
        updateZones(venue.zones.filter((z) => z.id !== id));
    };

    const handleUpdateZone = (id: string, field: keyof TicketZone, value: any) => {
        updateZones(
            venue.zones.map((z) => (z.id === id ? { ...z, [field]: value } : z))
        );
    };

    // Drag and Drop Logic
    const handleMouseDown = (e: React.MouseEvent, zone: TicketZone) => {
        e.stopPropagation();
        setSelectedZoneId(zone.id);
        setIsDragging(true);

        const svgRect = svgRef.current?.getBoundingClientRect();
        if (svgRect) {
            setDragOffset({
                x: e.clientX - svgRect.left - zone.x,
                y: e.clientY - svgRect.top - zone.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && selectedZoneId && svgRef.current) {
            const svgRect = svgRef.current.getBoundingClientRect();
            const x = e.clientX - svgRect.left - dragOffset.x;
            const y = e.clientY - svgRect.top - dragOffset.y;

            // Snap to grid (10px)
            const snappedX = Math.round(x / 10) * 10;
            const snappedY = Math.round(y / 10) * 10;

            updateZonePosition(selectedZoneId, snappedX, snappedY);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Helper to generate shape path
    const getShapePath = (width: number, height: number, shape: 'rectangle' | 'L' | 'T') => {
        switch (shape) {
            case 'L':
                return `M 0 0 H ${width / 2} V ${height / 2} H ${width} V ${height} H 0 Z`;
            case 'T':
                return `M 0 0 H ${width} V ${height / 2} H ${width * 0.75} V ${height} H ${width * 0.25} V ${height / 2} H 0 Z`;
            case 'rectangle':
            default:
                return `M 0 0 H ${width} V ${height} H 0 Z`;
        }
    };

    // Helper to render seating grid
    const renderSeating = (zone: TicketZone) => {
        if (zone.type !== 'seating') return null;

        const rows = Math.floor(Math.sqrt(zone.capacity));
        const cols = Math.ceil(zone.capacity / rows);
        const seatSize = Math.min(zone.width / cols, zone.height / rows) * 0.6;
        const gapX = (zone.width - (cols * seatSize)) / (cols + 1);
        const gapY = (zone.height - (rows * seatSize)) / (rows + 1);

        const seats = [];
        for (let i = 0; i < zone.capacity; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const cx = gapX + col * (seatSize + gapX) + seatSize / 2;
            const cy = gapY + row * (seatSize + gapY) + seatSize / 2;

            // Simple bounds check for shapes (approximate)
            let visible = true;
            if (zone.shape === 'L') {
                if (cx > zone.width / 2 && cy < zone.height / 2) visible = false;
            } else if (zone.shape === 'T') {
                if ((cx < zone.width * 0.25 || cx > zone.width * 0.75) && cy > zone.height / 2) visible = false;
            }

            if (visible) {
                seats.push(
                    <circle key={i} cx={cx} cy={cy} r={seatSize / 2} fill="white" opacity="0.8" />
                );
            }
        }
        return <g>{seats}</g>;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Controls */}
            <div className="space-y-6 h-[600px] overflow-y-auto pr-2">
                {/* Template Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Plantilla</label>
                    <div className="grid grid-cols-2 gap-2">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => setVenueType(template.id)}
                                className={`p-2 rounded border text-left text-sm ${venue.type === template.id ? "border-indigo-600 bg-indigo-50" : "border-gray-200"}`}
                            >
                                {template.icon} {template.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Zone List */}
                {venue.type && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">Zonas</label>
                            <button onClick={handleAddZone} className="text-xs flex items-center text-indigo-600 font-medium">
                                <Plus className="w-3 h-3 mr-1" /> Agregar
                            </button>
                        </div>
                        <div className="space-y-2">
                            {venue.zones.map((zone) => (
                                <div
                                    key={zone.id}
                                    onClick={() => setSelectedZoneId(zone.id)}
                                    className={`p-3 rounded border cursor-pointer ${selectedZoneId === zone.id ? "border-indigo-600 bg-indigo-50" : "border-gray-200"}`}
                                >
                                    <div className="flex justify-between mb-2">
                                        <input
                                            value={zone.name}
                                            onChange={(e) => handleUpdateZone(zone.id, "name", e.target.value)}
                                            className="text-sm font-bold bg-transparent border-none p-0 focus:ring-0 w-24"
                                        />
                                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleRemoveZone(zone.id); }} />
                                    </div>

                                    {selectedZoneId === zone.id && (
                                        <div className="space-y-3 pt-2 border-t border-indigo-100">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs text-gray-500">Capacidad</label>
                                                    <input type="number" value={zone.capacity} onChange={(e) => handleUpdateZone(zone.id, "capacity", Number(e.target.value))} className="w-full text-xs rounded border-gray-300" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Precio</label>
                                                    <input type="number" value={zone.price} onChange={(e) => handleUpdateZone(zone.id, "price", Number(e.target.value))} className="w-full text-xs rounded border-gray-300" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Tipo de Zona</label>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateZone(zone.id, 'type', 'standing')}
                                                        className={`flex-1 py-1 text-xs rounded border ${zone.type === 'standing' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600'}`}
                                                    >
                                                        <Move className="w-3 h-3 inline mr-1" /> Pie
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateZone(zone.id, 'type', 'seating')}
                                                        className={`flex-1 py-1 text-xs rounded border ${zone.type === 'seating' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600'}`}
                                                    >
                                                        <Armchair className="w-3 h-3 inline mr-1" /> Sillas
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Forma</label>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleUpdateZone(zone.id, 'shape', 'rectangle')} className={`p-1 rounded border ${zone.shape === 'rectangle' ? 'bg-indigo-100 border-indigo-500' : ''}`} title="Rectángulo"><Box className="w-4 h-4" /></button>
                                                    <button onClick={() => handleUpdateZone(zone.id, 'shape', 'L')} className={`p-1 rounded border ${zone.shape === 'L' ? 'bg-indigo-100 border-indigo-500' : ''}`} title="Forma L">L</button>
                                                    <button onClick={() => handleUpdateZone(zone.id, 'shape', 'T')} className={`p-1 rounded border ${zone.shape === 'T' ? 'bg-indigo-100 border-indigo-500' : ''}`} title="Forma T">T</button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Rotación ({zone.rotation}°)</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="360"
                                                    step="15"
                                                    value={zone.rotation || 0}
                                                    onChange={(e) => handleUpdateZone(zone.id, 'rotation', Number(e.target.value))}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Interactive SVG */}
            <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative h-[600px] flex flex-col">
                {!venue.type ? (
                    <div className="flex-1 flex items-center justify-center text-center text-gray-400">
                        <p>Selecciona una plantilla para comenzar</p>
                    </div>
                ) : (
                    <div className="flex-1 bg-white relative overflow-hidden select-none">
                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-500 border border-gray-200 shadow-sm">
                            Arrastra para mover • Usa los controles para editar
                        </div>

                        <svg
                            ref={svgRef}
                            width="100%"
                            height="100%"
                            className="w-full h-full cursor-crosshair"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />

                            {/* Stage (Fixed for now) */}
                            <g transform="translate(200, 20)">
                                <rect width="300" height="60" rx="8" fill="#1f2937" />
                                <text x="150" y="35" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" dominantBaseline="middle">ESCENARIO</text>
                            </g>

                            {/* Zones */}
                            {venue.zones.map((zone) => (
                                <g
                                    key={zone.id}
                                    transform={`translate(${zone.x || 50}, ${zone.y || 100}) rotate(${zone.rotation || 0}, ${(zone.width || 150) / 2}, ${(zone.height || 100) / 2})`}
                                    onMouseDown={(e) => handleMouseDown(e, zone)}
                                    className="cursor-move hover:opacity-90 transition-opacity"
                                    style={{ cursor: isDragging && selectedZoneId === zone.id ? 'grabbing' : 'grab' }}
                                >
                                    {/* Zone Shape */}
                                    <path
                                        d={getShapePath(zone.width || 150, zone.height || 100, zone.shape || 'rectangle')}
                                        fill={zone.color}
                                        fillOpacity={zone.type === 'seating' ? "0.9" : "0.3"}
                                        stroke={zone.color}
                                        strokeWidth={selectedZoneId === zone.id ? 3 : 1}
                                    />

                                    {/* Seating Dots */}
                                    {zone.type === 'seating' && renderSeating(zone)}

                                    {/* Zone Info (Only if standing or large enough) */}
                                    {zone.type === 'standing' && (
                                        <>
                                            <text
                                                x={(zone.width || 150) / 2}
                                                y={(zone.height || 100) / 2 - 10}
                                                textAnchor="middle"
                                                fill={zone.color}
                                                fontSize="12"
                                                fontWeight="bold"
                                                pointerEvents="none"
                                            >
                                                {zone.name}
                                            </text>
                                            <text
                                                x={(zone.width || 150) / 2}
                                                y={(zone.height || 100) / 2 + 10}
                                                textAnchor="middle"
                                                fill={zone.color}
                                                fontSize="14"
                                                fontWeight="bold"
                                                pointerEvents="none"
                                            >
                                                {zone.capacity} pax
                                            </text>
                                        </>
                                    )}
                                </g>
                            ))}
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
