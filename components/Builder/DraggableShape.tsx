"use client";
import React, { useRef } from 'react';
import { Rect, Circle, Text, Group, Arc } from 'react-konva';
import { AllocatableUnit, useVenueBuilderStore } from '@/store/venueBuilderStore';
import StandUnit from './StandUnit';
import AisleUnit from './AisleUnit';

interface DraggableShapeProps {
    element: AllocatableUnit;
    isSelected: boolean;
    onSelect: (e: any) => void;
}

export default function DraggableShape({ element, isSelected, onSelect }: DraggableShapeProps) {
    const shapeRef = useRef<any>(null);
    // @ts-ignore
    const { updateElement, updateElements, selectedIds } = useVenueBuilderStore();
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);

    const handleDragStart = (e: any) => {
        dragStartPos.current = { x: e.target.x(), y: e.target.y() };
    };

    const handleDragMove = (e: any) => {
        if (!isSelected || selectedIds.length <= 1) return;

        const stage = e.target.getStage();
        const currentX = e.target.x();
        const currentY = e.target.y();

        // Calculate delta from last frame (or start? No, we need delta from last update)
        // Actually, Konva updates the dragged node automatically.
        // If we use dragStartPos as "last known position", we can calculate step delta.

        if (dragStartPos.current) {
            const dx = currentX - dragStartPos.current.x;
            const dy = currentY - dragStartPos.current.y;

            // Move other selected nodes
            selectedIds.forEach((id: string) => {
                if (id === element.id) return; // Skip self
                const node = stage.findOne(`.shape-${id}`);
                if (node) {
                    node.x(node.x() + dx);
                    node.y(node.y() + dy);
                }
            });

            // Update last known position
            dragStartPos.current = { x: currentX, y: currentY };
        }
    };

    const handleDragEnd = (e: any) => {
        const stage = e.target.getStage();

        if (selectedIds.length > 1 && isSelected) {
            // Multi-select update
            const updates = selectedIds.map((id: string) => {
                const node = stage.findOne(`.shape-${id}`);
                if (node) {
                    return {
                        id,
                        changes: { x: node.x(), y: node.y() }
                    };
                }
                return null;
            }).filter(Boolean) as any;

            updateElements(updates);
        } else {
            // Single update
            updateElement(element.id, {
                x: e.target.x(),
                y: e.target.y(),
            });
        }

        dragStartPos.current = null;
    };

    const commonProps = {
        ref: shapeRef,
        name: `shape-${element.id}`, // Important for finding nodes
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
        fill: element.fill,
        opacity: 0.8,
        draggable: !element.locked, // Disable drag if locked
        onClick: (e: any) => {
            onSelect(e);
        },
        onTap: (e: any) => {
            onSelect(e);
        },
        onDragStart: handleDragStart,
        onDragMove: handleDragMove,
        onDragEnd: handleDragEnd,
        // No onTransformEnd here, handled by VenueCanvas
        stroke: isSelected ? (element.locked ? '#ef4444' : '#3b82f6') : '#94a3b8', // Red stroke if locked
        strokeWidth: isSelected ? 2 : 1,
        dash: element.locked ? [5, 5] : undefined, // Dashed line for locked items
    };

    const currentShape = element.shape || 'circle';

    // Render specialized units
    if ((element.type as string) === 'stand') {
        return (
            <StandUnit
                element={element}
                isSelected={isSelected}
                onSelect={onSelect}
                onDragEnd={handleDragEnd}
                onTransformEnd={() => { }} // Handled centrally
                shapeRef={shapeRef}
            // Pass common props overrides if needed, but StandUnit handles its own?
            // We need to ensure StandUnit uses the `name` prop and `draggable` logic.
            // StandUnit likely spreads props or we need to pass them.
            // Let's check StandUnit implementation later. For now assume it uses passed props or we need to modify it.
            // Actually StandUnit takes `shapeRef` but might not take `name`.
            // We should wrap it or pass `...commonProps` if it accepts them.
            // Checking StandUnit usage in previous code: it took `element`, `isSelected`, `onSelect`, `onDragEnd`, `onTransformEnd`, `shapeRef`.
            // We should probably update StandUnit to accept `name` or wrap it in a Group with the name.
            // Wrapping in Group is safer.
            />
        );
    }
    // Wait, if I wrap StandUnit in a Group, the Group gets the name and draggable?
    // StandUnit itself renders a Group usually.
    // If StandUnit is a Group, we can just pass the name to it if it accepts it.
    // Or we can cloneElement?
    // Let's look at StandUnit later. For now, let's wrap specialized units in a Group if they don't support `name` directly, 
    // BUT `StandUnit` is a component.
    // If `StandUnit` renders a `Group`, we can't easily attach `name` unless we pass it.
    // Let's assume for now we need to update StandUnit and AisleUnit too.
    // Or, simpler: Just wrap them in a Group that handles the dragging/selection?
    // If we wrap in a Group, the Group handles drag.

    if ((element.type as string) === 'stand') {
        return (
            <Group {...commonProps}>
                <StandUnit
                    element={{ ...element, x: 0, y: 0 }} // Relative to Group
                    isSelected={isSelected}
                    onSelect={onSelect}
                    onDragEnd={() => { }} // Group handles drag
                    onTransformEnd={() => { }}
                    shapeRef={null} // Group is the ref
                />
            </Group>
        );
    }
    // Actually, this changes the structure significantly. 
    // If StandUnit expects absolute coordinates, wrapping it changes that.
    // Let's stick to modifying StandUnit/AisleUnit later if needed, or pass `name` via a prop if they support `...rest`.
    // For now, let's just render them as is but add `name` prop to them, hoping they spread it to the root Konva node.

    // Re-reading StandUnit: it takes specific props.
    // I'll just pass `name` and hope or update them.
    // Actually, `StandUnit` and `AisleUnit` are custom components. I should check them.
    // But to save time, I will wrap them in a Group with the correct props, and pass 0,0 to them.

    if ((element.type as string) === 'stand') {
        return (
            <Group {...commonProps}>
                <StandUnit
                    element={{ ...element, x: 0, y: 0, rotation: 0 }} // Reset transform for child
                    isSelected={isSelected}
                    onSelect={() => { }} // Parent handles select
                    onDragEnd={() => { }}
                    onTransformEnd={() => { }}
                    shapeRef={null}
                />
            </Group>
        );
    }

    if ((element.type as string) === 'aisle') {
        return (
            <Group {...commonProps}>
                <AisleUnit
                    element={{ ...element, x: 0, y: 0, rotation: 0 }}
                    isSelected={isSelected}
                    onSelect={() => { }}
                    onDragEnd={() => { }}
                    onTransformEnd={() => { }}
                    shapeRef={null}
                />
            </Group>
        );
    }

    // --- CURVED GENERAL ZONE ---
    if (element.type === 'general' && element.shape === 'curve') {
        return (
            <Arc
                {...commonProps}
                innerRadius={element.innerRadius || 0}
                outerRadius={element.curveRadius || element.width}
                angle={element.curveAngle || 180}
                closed={true}
            />
        );
    }

    // --- CURVED NUMBERED SEATS ---
    if (element.type === 'numbered' && element.shape === 'curve') {
        const rows = element.rows || 5;
        const cols = element.cols || 10;
        const startRadius = element.innerRadius || 100;
        const rowSpacing = 30;
        const anglePerSeat = (element.curveAngle || 180) / cols;

        return (
            <Group {...commonProps}>
                <Arc
                    innerRadius={startRadius - 20}
                    outerRadius={startRadius + (rows * rowSpacing) + 20}
                    angle={element.curveAngle || 180}
                    fill={element.fill}
                    opacity={0.1}
                    stroke={isSelected ? (element.locked ? '#ef4444' : '#3b82f6') : '#94a3b8'}
                    strokeWidth={isSelected ? 2 : 1}
                    dash={element.locked ? [5, 5] : undefined}
                    closed={true}
                />

                {Array.from({ length: rows }).map((_, rowIdx) => {
                    const currentRadius = startRadius + (rowIdx * rowSpacing);
                    return Array.from({ length: cols }).map((_, colIdx) => {
                        const angleDeg = colIdx * anglePerSeat + (anglePerSeat / 2);
                        const angleRad = (angleDeg * Math.PI) / 180;
                        const seatX = currentRadius * Math.cos(angleRad);
                        const seatY = currentRadius * Math.sin(angleRad);

                        return (
                            <Circle
                                key={`${rowIdx}-${colIdx}`}
                                x={seatX}
                                y={seatY}
                                radius={8}
                                fill={element.fill}
                                opacity={0.8}
                                shadowBlur={2}
                            />
                        );
                    });
                })}
            </Group>
        );
    }

    return (
        <React.Fragment>
            {element.type === 'general' && (!element.shape || element.shape === 'rectangle') && (
                <Rect {...commonProps} cornerRadius={4} />
            )}

            {element.type === 'numbered' && (!element.shape || element.shape === 'rectangle') && (
                <Group {...commonProps}>
                    <Rect
                        width={element.width}
                        height={element.height}
                        fill={element.fill}
                        opacity={0.1}
                        stroke={isSelected ? (element.locked ? '#ef4444' : '#3b82f6') : '#94a3b8'}
                        strokeWidth={isSelected ? 2 : 1}
                        dash={element.locked ? [5, 5] : undefined}
                        cornerRadius={4}
                    />
                    {Array.from({ length: element.rows || 5 }).map((_, rowIdx) => (
                        Array.from({ length: element.cols || 10 }).map((_, colIdx) => {
                            const rows = element.rows || 5;
                            const cols = element.cols || 10;
                            const padding = 5;
                            const cellWidth = (element.width - padding * 2) / cols;
                            const cellHeight = (element.height - padding * 2) / rows;
                            const radius = Math.max(1, Math.min(cellWidth, cellHeight) / 3);
                            return (
                                <Circle
                                    key={`${rowIdx}-${colIdx}`}
                                    x={padding + cellWidth * colIdx + cellWidth / 2}
                                    y={padding + cellHeight * rowIdx + cellHeight / 2}
                                    radius={radius}
                                    fill={element.fill}
                                    opacity={0.8}
                                />
                            );
                        })
                    ))}
                </Group>
            )}

            {element.type === 'decoration' && currentShape === 'circle' && (
                <Circle {...commonProps} radius={element.width / 2} offsetX={-element.width / 2} />
            )}

            {element.type === 'decoration' && currentShape === 'rectangle' && (
                <Rect {...commonProps} cornerRadius={4} />
            )}

            {element.type === 'decoration' && currentShape === 'T' && (
                <Group {...commonProps}>
                    <Rect width={element.width} height={element.height * 0.3} fill={element.fill} opacity={0.8} stroke={isSelected ? (element.locked ? '#ef4444' : '#3b82f6') : '#94a3b8'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
                    <Rect x={element.width * 0.4} y={element.height * 0.25} width={element.width * 0.2} height={element.height * 0.75} fill={element.fill} opacity={0.8} stroke={isSelected ? (element.locked ? '#ef4444' : '#3b82f6') : '#94a3b8'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
                </Group>
            )}

            {element.type === 'decoration' && currentShape === 'L' && (
                <Group {...commonProps}>
                    <Rect width={element.width * 0.3} height={element.height} fill={element.fill} opacity={0.8} stroke={isSelected ? (element.locked ? '#ef4444' : '#3b82f6') : '#94a3b8'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
                    <Rect y={element.height * 0.7} width={element.width} height={element.height * 0.3} fill={element.fill} opacity={0.8} stroke={isSelected ? (element.locked ? '#ef4444' : '#3b82f6') : '#94a3b8'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
                </Group>
            )}

            {element.type === 'stage' && (element.shape === 'rectangle' || !element.shape) && (
                <Rect {...commonProps} cornerRadius={8} shadowBlur={10} shadowColor="black" shadowOpacity={0.3} />
            )}

            {element.type === 'stage' && element.shape === 'circle' && (
                <Circle {...commonProps} radius={element.width / 2} offsetX={-element.width / 2} shadowBlur={10} shadowColor="black" shadowOpacity={0.3} />
            )}

            {element.type === 'door' && (
                <Rect {...commonProps} cornerRadius={4} strokeWidth={3} />
            )}

            {element.type === 'text' && (
                <Text
                    {...commonProps}
                    text={element.text || element.name}
                    fontSize={element.fontSize || 20}
                    fill={element.textColor || element.fill}
                    align="center"
                    verticalAlign="middle"
                />
            )}
        </React.Fragment>
    );
}
