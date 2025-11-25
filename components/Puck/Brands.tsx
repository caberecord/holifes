'use client';

import React from 'react';

interface Brand {
    name: string;
    image: string;
    url?: string;
}

interface BrandsProps {
    title?: string;
    brands: Brand[];
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export function Brands({
    title,
    brands = [],
    backgroundColor,
    textColor,
    fontFamily = "inter"
}: BrandsProps) {

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

    if (brands.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Agrega marcas o patrocinadores</p>
            </div>
        );
    }

    return (
        <section
            className={`py-12 px-4 ${fontClass}`}
            style={{
                backgroundColor: backgroundColor || 'white',
                color: textColor || '#111827'
            }}
        >
            <div className="max-w-7xl mx-auto">
                {title && (
                    <h3
                        className="text-2xl font-bold text-center mb-10"
                        style={{ color: textColor || '#9CA3AF' }}
                    >
                        {title}
                    </h3>
                )}

                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
                    {brands.map((brand, index) => (
                        <div key={index} className="group relative">
                            {brand.url ? (
                                <a
                                    href={brand.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block transition-transform hover:scale-105"
                                >
                                    <img
                                        src={brand.image}
                                        alt={brand.name}
                                        className="h-12 md:h-16 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                                    />
                                </a>
                            ) : (
                                <img
                                    src={brand.image}
                                    alt={brand.name}
                                    className="h-12 md:h-16 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
