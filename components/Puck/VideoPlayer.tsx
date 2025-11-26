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

    // Alignment logic
    // If center, we use mx-auto. If left/right, we don't use mx-auto on the container, 
    // but we might need flex positioning on the parent or specific margins.
    // Let's use flex on the wrapper to position the content container.
    const wrapperAlignmentClass = {
        left: "items-start",
        center: "items-center",
        right: "items-end"
    }[alignment];

    const textAlignmentClass = {
        left: "text-left",
        center: "text-center",
        right: "text-right"
    }[alignment];

    return (
        <section
            className={`w-full py-12 px-4 flex flex-col ${wrapperAlignmentClass}`}
            style={{
                backgroundColor: backgroundColor || 'transparent',
                color: textColor || 'inherit'
            }}
        >
            <div className={`w-full max-w-4xl flex flex-col ${textAlignmentClass}`}>
                {title && (
                    <h2 className={`text-3xl font-bold mb-6 ${fontClass}`}>{title}</h2>
                )}

                {embedUrl ? (
                    <div key={embedUrl} className="w-full aspect-video rounded-xl overflow-hidden shadow-xl mb-6">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
                        <p className="text-gray-500">Ingresa una URL de video válida</p>
                    </div>
                )}

                {description && (
                    <p className={`text-lg opacity-90 max-w-2xl ${fontClass} ${alignment === 'center' ? 'mx-auto' : ''} ${alignment === 'right' ? 'ml-auto' : ''}`}>
                        {description}
                    </p>
                )}
            </div>
        </section>
    );
};
