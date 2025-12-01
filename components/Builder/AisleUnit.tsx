import React from 'react';
import { Rect, Text, Group } from 'react-konva';
import { AllocatableUnit, PIXELS_PER_METER } from '@/store/venueBuilderStore';

interface AisleUnitProps {
    element: AllocatableUnit;
    isSelected: boolean;
    onSelect: (e: any) => void;
    onDragEnd: (e: any) => void;
    onTransformEnd: (e: any) => void;
    shapeRef: any;
}

export default function AisleUnit({
    element,
    isSelected,
    onSelect,
    onDragEnd,
    onTransformEnd,
    shapeRef
}: AisleUnitProps) {

    const widthMeters = (element.width / PIXELS_PER_METER).toFixed(1);

    return (
        <Group
            id={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            draggable
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
            ref={shapeRef}
        >
            {/* Aisle Floor */}
            <Rect
                width={element.width}
                height={element.height}
                fill={element.fill || "#f8fafc"} // Use element fill or default
                stroke={isSelected ? '#2563eb' : '#cbd5e1'}
                strokeWidth={1}
                dash={[10, 5]} // Dashed line to indicate zone
            />

            {/* Label */}
            <Text
                text="PASILLO"
                fontSize={12}
                width={element.width}
                align="center"
                y={element.height / 2 - 6}
                fill="#94a3b8"
                rotation={element.width < element.height ? 90 : 0} // Rotate text if vertical aisle
                offsetX={element.width < element.height ? -element.height / 2 + element.width / 2 : 0}
                offsetY={element.width < element.height ? element.width / 2 : 0}
                listening={false}
            />
        </Group>
    );
}
