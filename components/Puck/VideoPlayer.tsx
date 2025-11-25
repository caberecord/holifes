import React from 'react';

interface VideoPlayerProps {
    url: string;
    title?: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
    // Función simple para obtener ID de YouTube o Vimeo
    const getEmbedUrl = (url: string) => {
        if (!url) return '';

        // YouTube
        const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]*).*/);
        if (youtubeMatch && youtubeMatch[1]) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }

        // Vimeo
        const vimeoMatch = url.match(/(?:vimeo\.com\/)([0-9]+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        return url; // Fallback
    };

    const embedUrl = getEmbedUrl(url);

    if (!embedUrl) {
        return (
            <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg border-2 border-dashed border-gray-300">
                <p>Ingresa una URL de video válida</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            {title && <h3 className="text-2xl font-bold mb-4 text-center">{title}</h3>}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe
                    src={embedUrl}
                    title={title || "Video player"}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        </div>
    );
}
