'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselImage {
    url: string;
    alt?: string;
}

interface PhotoCarouselProps {
    title?: string;
    images: CarouselImage[];
    effect: 'slide' | 'coverflow';
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export function PhotoCarousel({
    title,
    images = [],
    effect = 'coverflow',
    backgroundColor,
    textColor,
    fontFamily = "inter"
}: PhotoCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const fontClass = {
        inter: 'font-inter',
        montserrat: 'font-montserrat',
        playfair: 'font-playfair',
        oswald: 'font-oswald',
        poppins: 'font-poppins',
        merriweather: 'font-merriweather',
        anton: 'font-anton',
        cormorant: 'font-cormorant',
        lilita: 'font-lilita',
        space: 'font-space',
        harlow: 'font-harlow',
        curlz: 'font-curlz',
        baguet: 'font-baguet',
        cascadia: 'font-cascadia',
        varsity: 'font-varsity',
        freshman: 'font-freshman',
        // Fallbacks
        modern: 'font-inter',
        bold: 'font-anton',
        retro: 'font-space',
    }[fontFamily] || 'font-inter';

    if (images.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Agrega imágenes al carrusel</p>
            </div>
        );
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <section
            className={`py-16 px-4 overflow-hidden ${fontClass}`}
            style={{
                backgroundColor: backgroundColor || '#111827',
                color: textColor || 'white'
            }}
        >
            <div className="max-w-6xl mx-auto">
                {title && (
                    <h2
                        className="text-3xl font-bold text-center mb-12"
                        style={{ color: textColor || 'white' }}
                    >
                        {title}
                    </h2>
                )}

                <div className="relative h-[400px] md:h-[500px] flex items-center justify-center perspective-1000">
                    {/* Controls */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Carousel Track */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {images.map((image, index) => {
                            // Calculate distance from current index
                            let offset = index - currentIndex;

                            // Handle wrapping for infinite loop effect logic (simplified for visual)
                            // Ideally we'd duplicate items or use modulo logic for "infinite" feel, 
                            // but for this implementation we'll keep it simple:
                            // If we are at the end and the item is at the start, treat it as "next"
                            // This simple logic works best for non-looping or simple looping.
                            // For true coverflow loop, we need more complex index handling.
                            // Let's stick to a centered view where index matches.

                            // Adjust offset for better looping visual if needed, but standard index comparison is safer for now.

                            const isActive = index === currentIndex;
                            const isPrev = index === (currentIndex - 1 + images.length) % images.length;
                            const isNext = index === (currentIndex + 1) % images.length;

                            // Only render active, prev, next and maybe one more for performance/visuals
                            // Or render all but animate them.

                            // Let's use a simpler approach: Render all, but style based on offset
                            // We need to handle the wrap-around index logic for the "offset" calculation
                            // to make the coverflow look continuous.

                            // Correct offset calculation for circular buffer
                            if (index === 0 && currentIndex === images.length - 1) offset = 1;
                            else if (index === images.length - 1 && currentIndex === 0) offset = -1;

                            // If effect is slide, simple x translation
                            // If effect is coverflow, rotateY and scale

                            // We will only render the current, prev, and next images to keep it clean,
                            // or render all if list is small. Let's render all but hide distant ones.

                            const isVisible = Math.abs(offset) <= 2;
                            if (!isVisible && images.length > 5) return null;

                            return (
                                <motion.div
                                    key={index}
                                    className="absolute w-[300px] md:w-[500px] aspect-[4/3] rounded-xl overflow-hidden shadow-2xl bg-gray-900"
                                    initial={false}
                                    animate={{
                                        x: effect === 'coverflow'
                                            ? offset * 100 + '%' // Overlap
                                            : offset * 110 + '%', // Spaced out
                                        scale: isActive ? 1 : 0.8,
                                        rotateY: effect === 'coverflow' ? -offset * 45 : 0,
                                        zIndex: isActive ? 10 : 10 - Math.abs(offset),
                                        opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.3,
                                        filter: isActive ? 'brightness(1)' : 'brightness(0.5) blur(2px)'
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 30
                                    }}
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        left: '50%',
                                        marginLeft: effect === 'coverflow' ? '-150px' : '-250px', // Half width adjustment roughly
                                        // Better centering:
                                        x: '-50%' // We'll let motion handle x offset
                                    }}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.alt || `Slide ${index}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {image.alt && (
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-center">
                                            <p className="text-lg font-medium">{image.alt}</p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex
                                ? 'bg-indigo-500 w-6'
                                : 'bg-gray-600 hover:bg-gray-500'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
