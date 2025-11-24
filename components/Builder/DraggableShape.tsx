"use client";
import React, { useRef, useEffect } from 'react';
import { Rect, Circle, Text, Transformer, Group } from 'react-konva';
import { CanvasElement, useVenueBuilderStore } from '@/store/venueBuilderStore';

interface DraggableShapeProps {
    element: CanvasElement;
    isSelected: boolean;
    onSelect: () => void;
}

export default function DraggableShape({ element, isSelected, onSelect }: DraggableShapeProps) {
    const shapeRef = useRef<any>(null);
    const trRef = useRef<any>(null);
    const { updateElement } = useVenueBuilderStore();

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const handleDragEnd = (e: any) => {
        updateElement(element.id, {
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    const handleTransformEnd = (e: any) => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        updateElement(element.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
        });
    };

    const commonProps = {
        ref: shapeRef,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
        fill: element.fill,
        opacity: 0.8,
        draggable: true,
        onClick: (e: any) => {
            e.cancelBubble = true;
            onSelect();
        },
        onTap: (e: any) => {
            e.cancelBubble = true;
            onSelect();
        },
        onDragEnd: handleDragEnd,
        onTransformEnd: handleTransformEnd,
        stroke: isSelected ? '#3b82f6' : '#94a3b8',
        strokeWidth: isSelected ? 2 : 1,
    };

    const currentShape = element.shape || 'circle';

    return (
        <React.Fragment>
            {element.type === 'general' && (
                <Rect {...commonProps} cornerRadius={4} />
            )}

            {element.type === 'numbered' && (
                <Group
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    rotation={element.rotation}
                    draggable
                    onClick={commonProps.onClick}
                    onTap={commonProps.onTap}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                    ref={shapeRef}
                >
                    <Rect
                        width={element.width}
                        height={element.height}
                        fill={element.fill}
                        opacity={0.1}
                        stroke={isSelected ? '#3b82f6' : '#94a3b8'}
                        strokeWidth={isSelected ? 2 : 1}
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
                    <Rect width={element.width} height={element.height * 0.3} fill={element.fill} opacity={0.8} stroke={isSelected ? '#3b82f6' : '#94a3b8'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
                    <Rect x={element.width * 0.4} y={element.height * 0.25} width={element.width * 0.2} height={element.height * 0.75} fill={element.fill} opacity={0.8} stroke={isSelected ? '#3b82f6' : '#94a3b8'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
                </Group>
            )}

            {element.type === 'decoration' && currentShape === 'L' && (
                <Group {...commonProps}>
                    <Rect width={element.width * 0.3} height={element.height} fill={element.fill} opacity={0.8} stroke={isSelected ? '#3b82f6' : '#94a3b8'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
                    <Rect y={element.height * 0.7} width={element.width} height={element.height * 0.3} fill={element.fill} opacity={0.8} stroke={isSelected ? '#3b82f6' : '#94a3b8'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
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
                <Text {...commonProps} text={element.text || element.name} fontSize={element.fontSize || 20} fill="#1e293b" align="center" verticalAlign="middle" />
            )}

            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 20 || newBox.height < 20) return oldBox;
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
}
