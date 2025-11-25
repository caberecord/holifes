'use client';

import React from 'react';
import { Twitter, Linkedin, Instagram, Facebook, Youtube, Globe, Video } from 'lucide-react';

// Map of platform names to Lucide icons
const iconMap: Record<string, any> = {
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
    facebook: Facebook,
    youtube: Youtube,
    tiktok: Video,
    website: Globe,
};

// Custom SVG for TikTok since Lucide might not have it
const TikTokIcon = ({ size, color }: { size: number, color: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ color }}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
    </svg>
);

interface SocialLink {
    platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'website' | 'youtube' | 'tiktok';
    url: string;
}

interface SocialNetworksProps {
    title?: string;
    links: SocialLink[];
    alignment: 'left' | 'center' | 'right';
    iconSize?: number;
    iconColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export function SocialNetworks({
    title,
    links = [],
    alignment,
    iconSize = 24,
    iconColor = '#4B5563',
    backgroundColor,
    textColor,
    fontFamily = "inter"
}: SocialNetworksProps) {

    const alignClass = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
    }[alignment];

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
        // Fallbacks
        modern: 'font-inter',
        bold: 'font-anton',
        retro: 'font-space',
    }[fontFamily] || 'font-inter';

    if (links.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Agrega enlaces a tus redes sociales</p>
            </div>
        );
    }

    return (
        <section
            className={`py-8 px-4 ${fontClass}`}
            style={{
                backgroundColor: backgroundColor || 'transparent',
                color: textColor || 'inherit'
            }}
        >
            <div className="max-w-6xl mx-auto">
                {title && (
                    <h3
                        className={`text-xl font-bold mb-6 flex ${alignClass}`}
                        style={{ color: textColor || '#111827' }}
                    >
                        {title}
                    </h3>
                )}
                <div className={`flex gap-6 flex-wrap ${alignClass}`}>
                    {links.map((link, i) => {
                        const IconComponent = iconMap[link.platform] || Globe;

                        return (
                            <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-all hover:scale-110 p-2 rounded-full hover:bg-gray-50"
                                style={{ color: iconColor }}
                            >
                                {link.platform === 'tiktok' ? (
                                    <TikTokIcon size={iconSize} color={iconColor} />
                                ) : (
                                    <IconComponent size={iconSize} color={iconColor} />
                                )}
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
