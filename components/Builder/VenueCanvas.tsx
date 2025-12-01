"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Transformer, Image as KonvaImage } from 'react-konva';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useVenueBuilderStore, PIXELS_PER_METER } from '@/store/venueBuilderStore';
import DraggableShape from './DraggableShape';
import useImage from 'use-image';

const GRID_SIZE = PIXELS_PER_METER;

export default function VenueCanvas() {
    // @ts-ignore - new properties
    const {
        elements,
        selectElement,
        selectedIds,
        tool,
        addElement,
        updateElement,
        updateElements,
        clearSelection,
        backgroundImage,
        backgroundScale,
        backgroundOpacity,
        backgroundX,
        backgroundY,
        canvasSize,
        setCanvasSize
    } = useVenueBuilderStore();

    const stageRef = useRef<any>(null);
    const trRef = useRef<any>(null);
    const cropTrRef = useRef<any>(null); // Transformer for crop tool
    const cropRectRef = useRef<any>(null); // Rect for crop tool
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Load background image
    const [bgImage] = useImage(backgroundImage || '', 'anonymous');

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

    // Update Transformer nodes when selection changes
    useEffect(() => {
        if (trRef.current && stageRef.current) {
            // If crop tool is active, clear normal selection transformer
            if (tool === 'crop') {
                trRef.current.nodes([]);
                return;
            }

            const nodes = selectedIds
                .map((id: string) => stageRef.current.findOne(`.shape-${id}`))
                .filter(Boolean);

            trRef.current.nodes(nodes);
            trRef.current.getLayer().batchDraw();
        }
    }, [selectedIds, elements, tool]);

    // Update Crop Transformer
    useEffect(() => {
        if (tool === 'crop' && cropTrRef.current && cropRectRef.current) {
            cropTrRef.current.nodes([cropRectRef.current]);
            cropTrRef.current.getLayer().batchDraw();
        }
    }, [tool, canvasSize]);

    const handleTransformEnd = () => {
        if (!trRef.current) return;

        const nodes = trRef.current.nodes();
        const updates = nodes.map((node: any) => {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Reset scale to 1 and update width/height
            node.scaleX(1);
            node.scaleY(1);

            const elementId = node.name().replace('shape-', '');
            const element = elements.find((el: any) => el.id === elementId);

            const changes: any = {
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
                rotation: node.rotation(),
            };

            // Special handling for curved elements: scale the radius
            if (element && element.shape === 'curve') {
                // Use the maximum scale factor to drive radius change (uniform scaling feel)
                const scale = Math.max(scaleX, scaleY);

                if (element.innerRadius) {
                    changes.innerRadius = Math.round(element.innerRadius * scale);
                }

                if (element.curveRadius) {
                    changes.curveRadius = Math.round(element.curveRadius * scale);
                }
            }

            return {
                id: elementId,
                changes
            };
        });

        if (updates.length > 0) {
            updateElements(updates);
        }
    };

    const handleCropTransformEnd = () => {
        if (!cropRectRef.current) return;
        const node = cropRectRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Calculate new size
        const newWidth = Math.max(100, node.width() * scaleX);
        const newHeight = Math.max(100, node.height() * scaleY);

        // Reset scale
        node.scaleX(1);
        node.scaleY(1);

        // Update store
        setCanvasSize({ width: Math.round(newWidth), height: Math.round(newHeight) });
    };

    // Handle click-to-place and selection clearing
    const handleStageClick = (e: any) => {
        // If clicked on empty stage
        if (e.target === e.target.getStage()) {
            if (tool === 'select') {
                clearSelection();
                return;
            }

            if (tool === 'crop') return; // Do nothing on click if cropping

            // Place element if tool selected
            const stage = e.target.getStage();
            // Get pointer position relative to the stage (accounting for zoom/pan)
            const transform = stage.getAbsoluteTransform().copy();
            transform.invert();
            const pos = transform.point(stage.getPointerPosition());

            const typeMap: Record<string, any> = {
                'rectangle': 'general',
                'seat-matrix': 'numbered',
                'circle': 'decoration',
                'text': 'text',
                'stage': 'stage',
                'door': 'door',
                'stand': 'stand',
                'aisle': 'aisle',
                'general-curve': 'general-curve',
                'seat-curve': 'seat-curve'
            };

            const elementType = typeMap[tool];
            if (elementType) {
                // Snap to grid (optional, but good for stands)
                const snapX = Math.round(pos.x / (GRID_SIZE / 2)) * (GRID_SIZE / 2);
                const snapY = Math.round(pos.y / (GRID_SIZE / 2)) * (GRID_SIZE / 2);

                addElement(elementType, snapX, snapY);
            }
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-gray-50 overflow-hidden relative">
            <TransformWrapper
                initialScale={0.75}
                minScale={0.1}
                maxScale={4}
                limitToBounds={false}
                panning={{ disabled: tool !== 'select' }} // Disable panning when cropping? Maybe allow it.
                centerOnInit={true}
            >
                {() => (
                    <TransformComponent
                        wrapperClass="w-full h-full"
                        contentClass="w-full h-full flex items-center justify-center"
                    >
                        <div
                            style={{
                                width: canvasSize.width,
                                height: canvasSize.height,
                                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                                backgroundColor: '#f8fafc',
                                transition: 'width 0.2s, height 0.2s'
                            }}
                            className="shadow-2xl relative transition-all duration-200"
                        >
                            <Stage
                                width={canvasSize.width}
                                height={canvasSize.height}
                                ref={stageRef}
                                onClick={handleStageClick}
                                onTap={handleStageClick}
                            >
                                <Layer>
                                    {/* Blueprint / Background Image Layer */}
                                    {bgImage && (
                                        <KonvaImage
                                            image={bgImage}
                                            x={backgroundX}
                                            y={backgroundY}
                                            scaleX={backgroundScale}
                                            scaleY={backgroundScale}
                                            opacity={backgroundOpacity}
                                            listening={false} // Pass events through to grid/stage
                                        />
                                    )}

                                    {elements.map((el) => {
                                        // Heatmap Logic
                                        let displayFill = el.fill;
                                        if (useVenueBuilderStore.getState().viewMode === 'heatmap') {
                                            const maxPrice = Math.max(...elements.map(e => e.price || 0), 1);
                                            const minPrice = Math.min(...elements.map(e => e.price || 0));
                                            const price = el.price || 0;

                                            // Normalize price 0-1
                                            const range = maxPrice - minPrice || 1;
                                            const normalized = (price - minPrice) / range;

                                            // Color gradient: Green (low) -> Yellow -> Red (high)
                                            // Simple HSL interpolation: 120 (green) -> 0 (red)
                                            const hue = (1 - normalized) * 120;
                                            displayFill = `hsl(${hue}, 70%, 50%)`;
                                        }

                                        return (
                                            <DraggableShape
                                                key={el.id}
                                                element={{ ...el, fill: displayFill }} // Override fill for display
                                                isSelected={selectedIds?.includes(el.id)}
                                                onSelect={(e: any) => {
                                                    if (tool === 'crop') return; // Disable selection when cropping
                                                    // Handle multi-selection with Shift/Ctrl
                                                    const isMulti = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
                                                    selectElement(el.id, isMulti);
                                                    e.cancelBubble = true;
                                                }}
                                            />
                                        );
                                    })}

                                    {/* Normal Selection Transformer */}
                                    <Transformer
                                        ref={trRef}
                                        onTransformEnd={handleTransformEnd}
                                        boundBoxFunc={(oldBox, newBox) => {
                                            if (newBox.width < 5 || newBox.height < 5) {
                                                return oldBox;
                                            }
                                            return newBox;
                                        }}
                                    />

                                    {/* Crop Tool Overlay */}
                                    {tool === 'crop' && (
                                        <>
                                            <Rect
                                                ref={cropRectRef}
                                                x={0}
                                                y={0}
                                                width={canvasSize.width}
                                                height={canvasSize.height}
                                                stroke="#3b82f6"
                                                strokeWidth={4}
                                                dash={[10, 10]}
                                                fill="transparent"
                                                listening={true}
                                            />
                                            <Transformer
                                                ref={cropTrRef}
                                                rotateEnabled={false}
                                                keepRatio={false}
                                                anchorSize={25}
                                                anchorCornerRadius={5}
                                                onTransformEnd={handleCropTransformEnd}
                                                boundBoxFunc={(oldBox, newBox) => {
                                                    if (newBox.width < 100 || newBox.height < 100) {
                                                        return oldBox;
                                                    }
                                                    return newBox;
                                                }}
                                            />
                                        </>
                                    )}
                                </Layer>
                            </Stage>
                        </div>
                    </TransformComponent>
                )}
            </TransformWrapper>
        </div>
    );
}
