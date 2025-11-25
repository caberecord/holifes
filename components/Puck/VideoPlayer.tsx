'use client';

import React from 'react';

interface VideoPlayerProps {
    url: string;
    title?: string;
    alignment: "left" | "center" | "right";
    description?: string;
    backgroundColor?: string;
    textColor?: string;
}

export const VideoPlayer = ({
    url,
    title,
    alignment = "center",
    description,
    backgroundColor,
    textColor
}: VideoPlayerProps) => {
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

    const alignmentClass = {
        left: "text-left items-start",
        center: "text-center items-center",
        right: "text-right items-end"
    }[alignment];

    return (
        <section
            className="w-full py-12 px-4"
            style={{
                backgroundColor: backgroundColor || 'transparent',
                color: textColor || 'inherit'
            }}
        >
            <div className={`max-w-4xl mx-auto flex flex-col ${alignmentClass}`}>
                {title && (
                    <h2 className="text-3xl font-bold mb-6">{title}</h2>
                )}

                {embedUrl ? (
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-xl mb-6">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                        <p className="text-gray-500">Ingresa una URL de video válida</p>
                    </div>
                )}

                {description && (
                    <p className="text-lg opacity-90 max-w-2xl">
                        {description}
                    </p>
                )}
            </div>
        </section>
    );
};
