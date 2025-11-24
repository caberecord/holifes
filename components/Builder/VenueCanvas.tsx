"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useVenueBuilderStore } from '@/store/venueBuilderStore';
import DraggableShape from './DraggableShape';

const GRID_SIZE = 40;

export default function VenueCanvas() {
    const { elements, selectElement, selectedId, tool, addElement } = useVenueBuilderStore();
    const stageRef = useRef<any>(null);
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Resize observer
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Handle click-to-place
    const handleStageClick = (e: any) => {
        if (e.target !== e.target.getStage()) return;

        if (selectedId) {
            selectElement(null);
            return;
        }

        // Place element if tool selected
        if (tool !== 'select') {
            const stage = e.target.getStage();
            const pointerPosition = stage.getPointerPosition();

            const typeMap: Record<string, any> = {
                'rectangle': 'general',
                'seat-matrix': 'numbered',
                'circle': 'decoration',
                'text': 'text',
                'stage': 'stage',
                'door': 'door'
            };

            const elementType = typeMap[tool];
            if (elementType) {
                addElement(elementType, pointerPosition.x - 50, pointerPosition.y - 50);
            }
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-gray-50 overflow-hidden relative">
            <TransformWrapper
                initialScale={0.75}
                minScale={0.3}
                maxScale={4}
                limitToBounds={false}
                panning={{ disabled: tool !== 'select' }}
                centerOnInit={true}
            >
                {() => (
                    <TransformComponent
                        wrapperClass="w-full h-full"
                        contentClass="w-full h-full flex items-center justify-center"
                    >
                        <div
                            style={{
                                width: 1000,
                                height: 1000,
                                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                                backgroundColor: '#f8fafc'
                            }}
                            className="shadow-2xl"
                        >
                            <Stage
                                width={1000}
                                height={1000}
                                ref={stageRef}
                                onClick={handleStageClick}
                                onTap={handleStageClick}
                            >
                                <Layer>
                                    {elements.map((el) => (
                                        <DraggableShape
                                            key={el.id}
                                            element={el}
                                            isSelected={selectedId === el.id}
                                            onSelect={() => selectElement(el.id)}
                                        />
                                    ))}
                                </Layer>
                            </Stage>
                        </div>
                    </TransformComponent>
                )}
            </TransformWrapper>
        </div>
    );
}
