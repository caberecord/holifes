import React from 'react';
import { Rect, Text, Group, Image as KonvaImage } from 'react-konva';
import { AllocatableUnit, PIXELS_PER_METER } from '@/store/venueBuilderStore';
import useImage from 'use-image';

interface StandUnitProps {
    element: AllocatableUnit;
    isSelected: boolean;
    onSelect: (e: any) => void;
    onDragEnd: (e: any) => void;
    onTransformEnd: (e: any) => void;
    shapeRef: any;
}

// Sub-component to load image
const StandLogo = ({ src, width, height }: { src: string, width: number, height: number }) => {
    const [image] = useImage(src);
    if (!image) return null;

    // Calculate aspect ratio to fit within stand padding
    const padding = 10;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const scale = Math.min(
        availableWidth / image.width,
        availableHeight / image.height
    );

    const w = image.width * scale;
    const h = image.height * scale;

    return (
        <KonvaImage
            image={image}
            width={w}
            height={h}
            x={(width - w) / 2}
            y={(height - h) / 2}
            opacity={0.9}
        />
    );
};

export default function StandUnit({
    element,
    isSelected,
    onSelect,
    onDragEnd,
    onTransformEnd,
    shapeRef
}: StandUnitProps) {

    const widthMeters = (element.width / PIXELS_PER_METER).toFixed(1);
    const heightMeters = (element.height / PIXELS_PER_METER).toFixed(1);

    // Status colors
    const getFillColor = () => {
        switch (element.metadata?.status) {
            case 'sold': return '#e2e8f0'; // Gray
            case 'reserved': return '#fef08a'; // Yellow
            case 'blocked': return '#fee2e2'; // Red
            default: return '#ffffff'; // White (Available)
        }
    };

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
            {/* Stand Floor */}
            <Rect
                width={element.width}
                height={element.height}
                fill={getFillColor()}
                stroke={isSelected ? '#2563eb' : '#475569'}
                strokeWidth={isSelected ? 3 : 1}
                shadowBlur={isSelected ? 10 : 0}
                shadowColor="#2563eb"
                shadowOpacity={0.3}
            />

            {/* Logo (if exists) */}
            {element.metadata?.logo && (
                <StandLogo
                    src={element.metadata.logo}
                    width={element.width}
                    height={element.height}
                />
            )}

            {/* Stand Label (e.g., A-101) */}
            <Text
                text={element.name}
                fontSize={Math.max(12, element.width / 10)}
                fontStyle="bold"
                width={element.width}
                align="center"
                y={element.height / 2 - (element.metadata?.logo ? 0 : 10)} // Adjust if logo present
                fill={element.textColor || "#1e293b"} // Use textColor if available
                listening={false} // Click through text
            />

            {/* Dimensions (e.g., 3x3m) */}
            <Text
                text={`${widthMeters}x${heightMeters}m`}
                fontSize={Math.max(10, element.width / 12)}
                width={element.width}
                align="center"
                y={element.height - 20}
                fill="#64748b"
                listening={false}
            />
        </Group>
    );
}
