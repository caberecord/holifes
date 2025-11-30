'use client';

import React from 'react';

interface VideoPlayerProps {
    url: string;
    title?: string;
    alignment: "left" | "center" | "right";
    description?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export const VideoPlayer = ({
    url,
    title,
    alignment = "center",
    description,
    backgroundColor,
    textColor,
    fontFamily = "modern"
}: VideoPlayerProps) => {
    // Font mapping
    const fontMap: Record<string, string> = {
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
        serif: 'font-playfair',
        mono: 'font-space'
    };

    const fontClass = fontMap[fontFamily] || fontMap.modern;

    // Helper to get embed URL
    const getEmbedUrl = (url: string) => {
        if (!url) return "";

        // YouTube
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const videoId = url.includes("v=")
                ? url.split("v=")[1].split("&")[0]
                : url.split("/").pop();
            return `https://www.youtube.com/embed/${videoId}`;
        }

        // Vimeo
        if (url.includes("vimeo.com")) {
            const videoId = url.split("/").pop();
            return `https://player.vimeo.com/video/${videoId}`;
        }

        return url;
    };

    const embedUrl = getEmbedUrl(url);

    // Layout Logic:
    // Center: Stacked (Video Top, Text Bottom), Centered.
    // Left: Split (Video Left, Text Right).
    // Right: Split (Video Right, Text Left).

    const isSplit = alignment === 'left' || alignment === 'right';

    return (
        <section
            className="w-full py-12 px-4 md:px-12 lg:px-24"
            style={{
                backgroundColor: backgroundColor || 'transparent',
                color: textColor || 'inherit'
            }}
        >
            <div className={`w-full max-w-7xl mx-auto flex ${isSplit ? 'flex-col md:flex-row items-center gap-12' : 'flex-col items-center gap-8'}`}>

                {/* Video Container */}
                <div className={`w-full ${isSplit ? 'md:w-1/2' : 'max-w-4xl'} ${alignment === 'right' ? 'md:order-2' : ''}`}>
                    {embedUrl ? (
                        <div key={embedUrl} className="w-full aspect-video rounded-xl overflow-hidden shadow-xl">
                            <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                            <p className="text-gray-500">Ingresa una URL de video válida</p>
                        </div>
                    )}
                </div>

                {/* Text Container */}
                <div className={`w-full ${isSplit ? 'md:w-1/2' : 'max-w-4xl text-center'} ${alignment === 'right' ? 'md:order-1 text-left' : ''} ${alignment === 'left' ? 'text-left' : ''}`}>
                    {title && (
                        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${fontClass}`}>{title}</h2>
                    )}

                    {description && (
                        <p className={`text-lg opacity-90 ${fontClass}`}>
                            {description}
                        </p>
                    )}
                </div>

            </div>
        </section>
    );
};
