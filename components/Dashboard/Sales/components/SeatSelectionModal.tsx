"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Arc } from 'react-konva';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, MousePointer2 } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Event } from "@/types/event";

interface SeatSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event;
    zoneName: string;
    selectedSeats: string[];
    onSelectSeats: (seats: string[]) => void;
    soldSeats: string[]; // List of seat IDs that are already sold
}

const PIXELS_PER_METER = 20;

export const SeatSelectionModal: React.FC<SeatSelectionModalProps> = ({
    isOpen,
    onClose,
    event,
    zoneName,
    selectedSeats,
    onSelectSeats,
    soldSeats
}) => {
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            setStageSize({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            });
        }
    }, [isOpen]);

    // Calculate content bounds and initial transform
    const { initialScale, initialX, initialY } = useMemo(() => {
        const elements = event.venue?.venueMap?.elements || [];
        const canvasSize = event.venue?.venueMap?.canvasSize;

        // If canvasSize is defined (cropped), use it as the definitive bounds
        if (canvasSize && canvasSize.width > 0 && canvasSize.height > 0) {
            const scaleX = stageSize.width / canvasSize.width;
            const scaleY = stageSize.height / canvasSize.height;
            const scale = Math.min(scaleX, scaleY, 1.5); // Cap max scale

            // Center the canvas
            const x = (stageSize.width - canvasSize.width * scale) / 2;
            const y = (stageSize.height - canvasSize.height * scale) / 2;

            return { initialScale: scale, initialX: x, initialY: y };
        }

        // Fallback: Calculate bounds from elements
        if (elements.length === 0) {
            return { initialScale: 1, initialX: 0, initialY: 0 };
        }

        // Try to find the specific zone element to focus on
        const targetZone = elements.find((el: any) => el.name === zoneName);

        // If target zone exists, focus ONLY on it. Otherwise, focus on all elements.
        const elementsToMeasure = targetZone ? [targetZone] : elements;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        elementsToMeasure.forEach((el: any) => {
            // Approximate bounds for each element type
            let elMinX = el.x;
            let elMinY = el.y;
            let elMaxX = el.x;
            let elMaxY = el.y;

            if (el.type === 'numbered' || el.type === 'seating' || el.type === 'general' || el.type === 'stage') {
                elMaxX += el.width || 100;
                elMaxY += el.height || 100;
            } else if (el.type === 'numbered' && el.shape === 'curve') {
                // Approximate curve bounds (simplified)
                const radius = (el.innerRadius || 100) + ((el.rows || 5) * 30);
                elMaxX += radius * 2; // Rough overestimate
                elMaxY += radius;
                elMinX -= radius; // Curves can go left
            } else {
                // Default fallback
                elMaxX += 100;
                elMaxY += 100;
            }

            minX = Math.min(minX, elMinX);
            minY = Math.min(minY, elMinY);
            maxX = Math.max(maxX, elMaxX);
            maxY = Math.max(maxY, elMaxY);
        });

        // Add some padding to bounds
        const padding = 50;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;

        if (contentWidth <= 0 || contentHeight <= 0) return { initialScale: 1, initialX: 0, initialY: 0 };

        const scaleX = stageSize.width / contentWidth;
        const scaleY = stageSize.height / contentHeight;
        const scale = Math.min(scaleX, scaleY, 1.5); // Cap max scale

        // Center the content
        const x = (stageSize.width - contentWidth * scale) / 2 - minX * scale;
        const y = (stageSize.height - contentHeight * scale) / 2 - minY * scale;

        return { initialScale: scale, initialX: x, initialY: y };
    }, [event.venue?.venueMap?.elements, event.venue?.venueMap?.canvasSize, stageSize, zoneName]);

    if (!isOpen) return null;

    const elements = event.venue?.venueMap?.elements || [];

    const handleSeatClick = (seatId: string) => {
        const fullSeatIdWithZone = `${zoneName}:${seatId}`;
        if (soldSeats.includes(fullSeatIdWithZone)) return;

        const isSelected = selectedSeats.includes(seatId);
        if (isSelected) {
            onSelectSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            onSelectSeats([...selectedSeats, seatId]);
        }
    };

    // Helper to render elements (simplified version of DraggableShape for read-only view)
    const renderElement = (element: any) => {
        const isTargetZone = element.name === zoneName;
        // If we are focusing on a specific zone, dim others significantly or hide them?
        // Let's keep them visible but dim, as context is useful.
        const opacity = isTargetZone ? 1 : 0.15;

        if (element.type === 'numbered' && element.shape === 'curve') {
            const rows = element.rows || 5;
            const cols = element.cols || 10;
            const startRadius = element.innerRadius || 100;
            const rowSpacing = 30;
            const anglePerSeat = (element.curveAngle || 180) / cols;

            return (
                <Group
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    rotation={element.rotation}
                    opacity={opacity}
                >
                    {/* Background Arc */}
                    <Arc
                        innerRadius={startRadius - 20}
                        outerRadius={startRadius + (rows * rowSpacing) + 20}
                        angle={element.curveAngle || 180}
                        fill={element.fill}
                        opacity={0.1}
                        closed={true}
                    />

                    {/* Seats */}
                    {Array.from({ length: rows }).map((_, rowIdx) => {
                        const currentRadius = startRadius + (rowIdx * rowSpacing);
                        const rowLabel = String.fromCharCode(65 + rowIdx); // A, B, C...

                        return Array.from({ length: cols }).map((_, colIdx) => {
                            const angleDeg = colIdx * anglePerSeat + (anglePerSeat / 2);
                            const angleRad = (angleDeg * Math.PI) / 180;
                            const seatX = currentRadius * Math.cos(angleRad);
                            const seatY = currentRadius * Math.sin(angleRad);

                            const seatNumber = colIdx + 1;
                            const fullSeatId = `${rowLabel}${seatNumber}`;
                            const fullSeatIdWithZone = `${zoneName}:${fullSeatId}`;

                            const isSold = soldSeats.includes(fullSeatIdWithZone);
                            const isSelected = selectedSeats.includes(fullSeatId);

                            return (
                                <Group
                                    key={`${rowIdx}-${colIdx}`}
                                    x={seatX}
                                    y={seatY}
                                    onClick={(e) => {
                                        e.cancelBubble = true;
                                        if (isTargetZone) handleSeatClick(fullSeatId);
                                    }}
                                    onTap={(e) => {
                                        e.cancelBubble = true;
                                        if (isTargetZone) handleSeatClick(fullSeatId);
                                    }}
                                    onMouseEnter={(e) => {
                                        const container = e.target.getStage()?.container();
                                        if (container) container.style.cursor = isTargetZone && !isSold ? 'pointer' : 'default';
                                    }}
                                    onMouseLeave={(e) => {
                                        const container = e.target.getStage()?.container();
                                        if (container) container.style.cursor = 'default';
                                    }}
                                >
                                    <Circle
                                        radius={8}
                                        fill={isSold ? '#ef4444' : isSelected ? '#4f46e5' : element.fill} // Red if sold, Indigo if selected
                                        stroke={isSelected ? '#312e81' : isSold ? '#b91c1c' : '#fff'}
                                        strokeWidth={isSelected ? 2 : 1}
                                        opacity={isSold ? 0.8 : 1}
                                        shadowBlur={isSelected ? 5 : 0}
                                        shadowColor="#4f46e5"
                                    />
                                    {/* Seat Label (optional, maybe zoom dependent) */}
                                    {/* <Text text={fullSeatId} fontSize={6} fill="white" offsetX={3} offsetY={3} /> */}
                                </Group>
                            );
                        });
                    })}
                </Group>
            );
        }

        // Rectangular Numbered Zone
        if (element.type === 'numbered' || element.type === 'seating') {
            const rows = element.rows || 5;
            const cols = element.cols || 10;
            const padding = 5;
            const cellWidth = (element.width - padding * 2) / cols;
            const cellHeight = (element.height - padding * 2) / rows;
            const radius = Math.max(1, Math.min(cellWidth, cellHeight) / 3);

            return (
                <Group
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    rotation={element.rotation}
                    opacity={opacity}
                >
                    <Rect
                        width={element.width}
                        height={element.height}
                        fill={element.fill}
                        opacity={0.1}
                        cornerRadius={4}
                    />
                    {Array.from({ length: rows }).map((_, rowIdx) => {
                        const rowLabel = String.fromCharCode(65 + rowIdx);
                        return Array.from({ length: cols }).map((_, colIdx) => {
                            const seatNumber = colIdx + 1;
                            const fullSeatId = `${rowLabel}${seatNumber}`;
                            const fullSeatIdWithZone = `${zoneName}:${fullSeatId}`;
                            const isSold = soldSeats.includes(fullSeatIdWithZone);
                            const isSelected = selectedSeats.includes(fullSeatId);

                            return (
                                <Group
                                    key={`${rowIdx}-${colIdx}`}
                                    x={padding + cellWidth * colIdx + cellWidth / 2}
                                    y={padding + cellHeight * rowIdx + cellHeight / 2}
                                    onClick={(e) => {
                                        e.cancelBubble = true;
                                        if (isTargetZone) handleSeatClick(fullSeatId);
                                    }}
                                    onTap={(e) => {
                                        e.cancelBubble = true;
                                        if (isTargetZone) handleSeatClick(fullSeatId);
                                    }}
                                    onMouseEnter={(e) => {
                                        const container = e.target.getStage()?.container();
                                        if (container) container.style.cursor = isTargetZone && !isSold ? 'pointer' : 'default';
                                    }}
                                    onMouseLeave={(e) => {
                                        const container = e.target.getStage()?.container();
                                        if (container) container.style.cursor = 'default';
                                    }}
                                >
                                    <Circle
                                        radius={radius}
                                        fill={isSold ? '#ef4444' : isSelected ? '#4f46e5' : element.fill}
                                        stroke={isSelected ? '#312e81' : isSold ? '#b91c1c' : '#fff'}
                                        strokeWidth={isSelected ? 2 : 1}
                                        opacity={isSold ? 0.8 : 1}
                                        shadowBlur={isSelected ? 5 : 0}
                                        shadowColor="#4f46e5"
                                    />
                                </Group>
                            );
                        });
                    })}
                </Group>
            );
        }

        // Other elements (Stage, General, etc.) - just visual context
        if (element.type === 'stage') {
            return (
                <Rect
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    rotation={element.rotation}
                    fill="#333"
                    cornerRadius={8}
                    opacity={0.5}
                />
            );
        }

        if (element.type === 'general') {
            return (
                <Rect
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    rotation={element.rotation}
                    fill={element.fill}
                    opacity={0.2}
                    cornerRadius={4}
                />
            );
        }

        return null;
    };

    // Generate a unique key to force re-mount when elements change significantly OR when stage size changes
    const transformKey = useMemo(() => {
        const elements = event.venue?.venueMap?.elements || [];
        const canvasSize = event.venue?.venueMap?.canvasSize;

        // Create a simple hash of element positions to detect layout changes
        const layoutHash = elements.map((e: any) => `${e.id}:${e.x},${e.y},${e.width},${e.height}`).join('|');
        const canvasHash = canvasSize ? `${canvasSize.width}x${canvasSize.height}` : 'auto';
        const stageHash = `${stageSize.width}x${stageSize.height}`;

        return `transform-${elements.length}-${layoutHash}-${canvasHash}-${stageHash}-${zoneName}`;
    }, [event.venue?.venueMap?.elements, event.venue?.venueMap?.canvasSize, zoneName, stageSize]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-4 py-4 sm:px-6 sm:py-5 pt-8 sm:pt-8 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0 gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                            Seleccionar Asientos - {zoneName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                            <span className="whitespace-nowrap">{selectedSeats.length} seleccionados</span>
                            <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-600"></div> Tu Selección</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Vendido</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={onClose}
                            className="px-3 sm:px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                        >
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Confirmar</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200"
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-gray-50 relative overflow-hidden min-h-0" ref={containerRef}>
                    <TransformWrapper
                        key={transformKey}
                        initialScale={initialScale}
                        initialPositionX={initialX}
                        initialPositionY={initialY}
                        minScale={0.1}
                        maxScale={4}
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
                                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md border border-gray-100">
                                    <button onClick={() => zoomIn()} className="p-2 hover:bg-gray-50 rounded-md" title="Acercar">
                                        <ZoomIn className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button onClick={() => zoomOut()} className="p-2 hover:bg-gray-50 rounded-md" title="Alejar">
                                        <ZoomOut className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button onClick={() => resetTransform()} className="p-2 hover:bg-gray-50 rounded-md" title="Restablecer">
                                        <RotateCcw className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                                    <Stage
                                        width={stageSize.width}
                                        height={stageSize.height}
                                        scaleX={1}
                                        scaleY={1}
                                    >
                                        <Layer>
                                            {elements.map(renderElement)}
                                        </Layer>
                                    </Stage>
                                </TransformComponent>
                            </>
                        )}
                    </TransformWrapper>
                </div>
            </div>
        </div>
    );
};
