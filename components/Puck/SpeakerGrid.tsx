'use client';

import Image from 'next/image';

interface Speaker {
    name: string;
    role: string;
    bio?: string;
    image: string;
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        instagram?: string;
    };
}

interface SpeakerGridProps {
    title?: string;
    subtitle?: string;
    speakers: Speaker[];
    backgroundColor?: string;
    textColor?: string;
    cardTextColor?: string;
    cardBackgroundColor?: string;
    fontFamily?: string;
}

export function SpeakerGrid({
    title = "Nuestros Conferencistas",
    subtitle,
    speakers = [],
    backgroundColor,
    textColor,
    cardTextColor,
    cardBackgroundColor,
    fontFamily = "inter"
}: SpeakerGridProps) {
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

    if (speakers.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Agrega conferencistas o artistas a tu evento</p>
            </div>
        );
    }

    return (
        <section
            className={`py-16 px-4 ${fontClass}`}
            style={{
                backgroundColor: backgroundColor || '#F9FAFB',
                color: textColor || '#111827'
            }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                {(title || subtitle) && (
                    <div className="text-center mb-12">
                        {title && (
                            <h2
                                className="text-3xl md:text-4xl font-bold mb-4"
                                style={{ color: textColor || '#111827' }}
                            >
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p
                                className="text-lg max-w-2xl mx-auto"
                                style={{ color: textColor ? `${textColor}CC` : '#6B7280' }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {/* Speaker Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {speakers.map((speaker, index) => (
                        <div
                            key={index}
                            className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                            style={{ backgroundColor: cardBackgroundColor || '#FFFFFF' }}
                        >
                            {/* Speaker Image */}
                            <div className="relative h-64 overflow-hidden bg-gray-200">
                                {speaker.image ? (
                                    <Image
                                        src={speaker.image}
                                        alt={speaker.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                                        <span className="text-6xl font-bold text-white">
                                            {speaker.name?.charAt(0) || 'S'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Speaker Info */}
                            <div className="p-6">
                                <h3
                                    className="text-xl font-bold mb-1"
                                    style={{ color: cardTextColor || '#111827' }}
                                >
                                    {speaker.name}
                                </h3>
                                <p
                                    className="text-sm font-medium mb-3"
                                    style={{ color: cardTextColor ? `${cardTextColor}99` : '#6366F1' }}
                                >
                                    {speaker.role}
                                </p>
                                {speaker.bio && (
                                    <p
                                        className="text-sm line-clamp-3"
                                        style={{ color: cardTextColor ? `${cardTextColor}CC` : '#6B7280' }}
                                    >
                                        {speaker.bio}
                                    </p>
                                )}

                                {/* Social Links */}
                                {speaker.socialLinks && (
                                    <div className="flex gap-3 mt-4">
                                        {speaker.socialLinks.twitter && (
                                            <a
                                                href={speaker.socialLinks.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-blue-400 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                                </svg>
                                            </a>
                                        )}
                                        {speaker.socialLinks.linkedin && (
                                            <a
                                                href={speaker.socialLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                </svg>
                                            </a>
                                        )}
                                        {speaker.socialLinks.instagram && (
                                            <a
                                                href={speaker.socialLinks.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-pink-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
