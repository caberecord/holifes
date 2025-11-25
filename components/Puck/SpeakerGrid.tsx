'use client';

import { useEventContext } from '../../lib/context/EventContext';

interface SocialLink {
    platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'website';
    url: string;
}

interface Speaker {
    name: string;
    title: string;
    image?: string;
    bio?: string;
    socialLinks?: SocialLink[];
}

interface SpeakerGridProps {
    title: string;
    columns: 2 | 3 | 4;
    showBio: boolean;
    showSocial: boolean;
    speakers?: Speaker[];
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
}

export function SpeakerGrid({
    title,
    columns = 3,
    showBio = true,
    showSocial = true,
    speakers = [],
    backgroundColor,
    textColor,
    fontFamily = "inter"
}: SpeakerGridProps) {
    const event = useEventContext();

    // Combinar speakers del evento (DB) con los manuales (Puck)
    // Prioridad: Manuales > DB
    const dbSpeakers = event?.speakers?.map((s: any) => ({
        name: s.name,
        title: s.title || s.role,
        image: s.imageUrl,
        bio: s.bio,
        socialLinks: s.socialLinks
    })) || [];

    const displaySpeakers = speakers.length > 0 ? speakers : dbSpeakers;

    const gridCols: Record<number, string> = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4'
    };

    const colClass = gridCols[columns] || 'md:grid-cols-3';

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

    const getSocialIcon = (platform: string) => {
        switch (platform) {
            case 'twitter': return <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />;
            case 'linkedin': return <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></>;
            case 'facebook': return <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />;
            case 'instagram': return <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>;
            default: return <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />; // Link generic
        }
    };

    return (
        <section
            className={`py-16 px-4 ${fontClass}`}
            style={{
                backgroundColor: backgroundColor || '#F9FAFB',
                color: textColor || '#111827'
            }}
        >
            <div className="max-w-7xl mx-auto">
                {title && (
                    <h2
                        className="text-3xl font-bold text-center mb-12"
                        style={{ color: textColor || '#111827' }}
                    >
                        {title}
                    </h2>
                )}

                {displaySpeakers.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        No hay conferencistas registrados.
                    </div>
                ) : (
                    <div className={`grid grid-cols-1 ${colClass} gap-8`}>
                        {displaySpeakers.map((speaker, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                style={{
                                    backgroundColor: backgroundColor ? 'rgba(255,255,255,0.1)' : 'white',
                                    color: textColor || 'inherit'
                                }}
                            >
                                {/* Image */}
                                <div className="aspect-square relative bg-gray-100">
                                    {speaker.image ? (
                                        <img
                                            src={speaker.image}
                                            alt={speaker.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 text-center">
                                    <h3
                                        className="text-xl font-bold mb-1"
                                        style={{ color: textColor || '#111827' }}
                                    >
                                        {speaker.name}
                                    </h3>
                                    {speaker.title && (
                                        <p
                                            className="text-sm font-medium mb-4"
                                            style={{ color: textColor ? `${textColor}CC` : '#4F46E5' }}
                                        >
                                            {speaker.title}
                                        </p>
                                    )}

                                    {showBio && speaker.bio && (
                                        <p
                                            className="text-sm mb-4 line-clamp-3"
                                            style={{ color: textColor ? `${textColor}99` : '#6B7280' }}
                                        >
                                            {speaker.bio}
                                        </p>
                                    )}

                                    {showSocial && speaker.socialLinks && speaker.socialLinks.length > 0 && (
                                        <div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
                                            {speaker.socialLinks.map((link: any, i: number) => (
                                                <a
                                                    key={i}
                                                    href={link.url}
                                                    target="_blank"
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                    style={{ color: textColor ? `${textColor}99` : undefined }}
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        {getSocialIcon(link.platform)}
                                                    </svg>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
