"use client";
import React from 'react';
import { X } from 'lucide-react';
import { useVenueBuilderStore, PIXELS_PER_METER } from '@/store/venueBuilderStore';

export default function PreviewModal() {
    // @ts-ignore
    const { is3DPreviewOpen, toggle3DPreview, elements, backgroundImage, backgroundScale, backgroundOpacity, backgroundX, backgroundY } = useVenueBuilderStore();

    if (!is3DPreviewOpen) return null;

    // Calculate bounds to center the content
    const minX = Math.min(...elements.map((el: any) => el.x), 0);
    const minY = Math.min(...elements.map((el: any) => el.y), 0);
    const maxX = Math.max(...elements.map((el: any) => el.x + el.width), 800);
    const maxY = Math.max(...elements.map((el: any) => el.y + el.height), 600);

    const width = maxX - minX;
    const height = maxY - minY;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Vista Previa 3D (2.5D)</h2>
                    <button
                        onClick={toggle3DPreview}
                        className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 3D Viewport */}
                <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-gray-950 perspective-container">
                    <div
                        className="relative transition-transform duration-500 transform-style-3d"
                        style={{
                            width: width,
                            height: height,
                            transform: 'rotateX(45deg) rotateZ(-15deg) scale(0.8)',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {/* Background Plane */}
                        <div
                            className="absolute inset-0 bg-gray-800/50 border border-gray-700 rounded-lg"
                            style={{
                                transform: 'translateZ(-1px)',
                                width: 2000, // Fixed large size for context
                                height: 2000,
                                left: -500,
                                top: -500
                            }}
                        >
                            {/* Grid */}
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: `linear-gradient(to right, #4b5563 1px, transparent 1px), linear-gradient(to bottom, #4b5563 1px, transparent 1px)`,
                                    backgroundSize: `${PIXELS_PER_METER}px ${PIXELS_PER_METER}px`
                                }}
                            />
                        </div>

                        {/* Elements */}
                        {elements.map((el: any) => (
                            <div
                                key={el.id}
                                className="absolute flex items-center justify-center text-xs font-bold text-white shadow-lg transition-all hover:translate-z-4"
                                style={{
                                    left: el.x,
                                    top: el.y,
                                    width: el.width,
                                    height: el.height,
                                    backgroundColor: el.fill,
                                    transform: `rotate(${el.rotation}deg) translateZ(0px)`,
                                    borderRadius: el.type === 'decoration' && el.shape === 'circle' ? '50%' : '4px',
                                    boxShadow: '4px 4px 10px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    // Add "height" effect via extrusion simulation (border-bottom)
                                    borderBottomWidth: el.type === 'stand' || el.type === 'stage' ? '10px' : '0px',
                                    borderBottomColor: 'rgba(0,0,0,0.3)'
                                }}
                            >
                                {el.type === 'stand' && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-[10px] whitespace-nowrap shadow-md" style={{ transform: 'rotateX(-45deg)' }}>
                                        {el.name}
                                    </div>
                                )}
                                {el.type === 'text' && (
                                    <span style={{ color: el.textColor || 'white', fontSize: el.fontSize }}>{el.text}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controls / Legend */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/50 text-sm text-gray-400">
                    <p>Esta es una vista simplificada para visualizar la distribución espacial y alturas relativas.</p>
                </div>
            </div>
        </div>
    );
}
