import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Event } from "@/types/event";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Force dynamic rendering since we depend on the subdomain
export const dynamic = "force-dynamic";

interface PageProps {
    params: {
        subdomain: string;
    };
}

async function getEventBySubdomain(subdomain: string): Promise<Event | null> {
    // In a real app, you might want to cache this or use a better lookup method
    // Firestore query by 'microsite.subdomain'
    // Note: You need an index on 'microsite.subdomain' for this to work efficiently
    try {
        const eventsRef = collection(db, "events");
        // We can't query nested fields easily without an index, but for now let's assume we can or fetch all (not scalable but works for MVP)
        // Better approach: Store a separate 'subdomains' collection mapping subdomain -> eventId

        // For this MVP, we'll query where 'microsite.subdomain' == subdomain
        // If this fails due to missing index, we might need to create one in Firebase Console
        const q = query(eventsRef, where("microsite.subdomain", "==", subdomain));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Event;
    } catch (error) {
        console.error("Error fetching event by subdomain:", error);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const event = await getEventBySubdomain(params.subdomain);
    if (!event) return { title: "Evento no encontrado" };

    return {
        title: event.microsite?.theme?.content?.hero?.title || event.name,
        description: event.microsite?.theme?.content?.hero?.subtitle || event.description,
    };
}

export default async function EventSitePage({ params }: PageProps) {
    const event = await getEventBySubdomain(params.subdomain);

    if (!event || !event.microsite?.enabled) {
        return notFound();
    }

    const { theme } = event.microsite;

    // Fallback if theme structure is old (optional, but good for safety)
    if (!theme.content) {
        return <div>Sitio en mantenimiento o estructura antigua.</div>;
    }

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundColor: theme.colorPalette.background,
                color: theme.colorPalette.text,
                fontFamily: theme.typography.bodyFont || 'sans-serif'
            }}
        >
            {/* 1. Hero Section */}
            <header className="relative min-h-[80vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
                {theme.imageKeyword && (
                    <>
                        <div
                            className="absolute inset-0 z-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(https://image.pollinations.ai/prompt/${encodeURIComponent(theme.imageKeyword)}?nologo=true&model=flux)`,
                                filter: "brightness(0.4)"
                            }}
                        />
                        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
                    </>
                )}

                <div className="relative z-10 max-w-5xl mx-auto space-y-6">
                    <div className="inline-block px-4 py-1 rounded-full border border-white/30 backdrop-blur-sm text-sm font-medium text-white/90 mb-4">
                        {theme.content.hero.subtitle}
                    </div>
                    <h1
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight drop-shadow-2xl"
                        style={{
                            fontFamily: theme.typography.headingFont,
                            color: "#ffffff"
                        }}
                    >
                        {theme.content.hero.title}
                    </h1>

                    {theme.content.hero.scarcityText && (
                        <p className="text-red-400 font-bold text-lg animate-pulse">
                            🔥 {theme.content.hero.scarcityText}
                        </p>
                    )}

                    <div className="pt-8">
                        <button
                            className="px-10 py-5 rounded-full text-xl font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95"
                            style={{
                                backgroundColor: theme.colorPalette.accent,
                                color: theme.colorPalette.background
                            }}
                        >
                            {theme.content.hero.ctaText}
                        </button>
                    </div>
                </div>
            </header>

            {/* 2. Value Proposition */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <div className="space-y-6">
                        <h2
                            className="text-4xl md:text-5xl font-bold"
                            style={{ fontFamily: theme.typography.headingFont, color: theme.colorPalette.primary }}
                        >
                            {theme.content.valueProp.headline}
                        </h2>
                        <p className="text-xl md:text-2xl leading-relaxed opacity-90">
                            {theme.content.valueProp.description}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 pt-8">
                        {theme.content.valueProp.keyPoints.map((point: string, i: number) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-black/5 shadow-sm">
                                <div className="text-lg font-semibold">{point}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Tickets */}
            <section className="py-24 px-6 bg-black/5">
                <div className="max-w-6xl mx-auto">
                    <h2
                        className="text-4xl font-bold text-center mb-16"
                        style={{ fontFamily: theme.typography.headingFont }}
                    >
                        {theme.content.tickets.headline}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                        {theme.content.tickets.items.map((ticket: any, i: number) => (
                            <div
                                key={i}
                                className={`relative p-8 rounded-3xl border transition-all hover:-translate-y-2 ${ticket.recommended ? 'border-2 shadow-2xl scale-105 z-10' : 'border-black/10 shadow-lg bg-white'}`}
                                style={{
                                    borderColor: ticket.recommended ? theme.colorPalette.accent : 'transparent',
                                    backgroundColor: ticket.recommended ? theme.colorPalette.background : '#ffffff'
                                }}
                            >
                                {ticket.recommended && (
                                    <div
                                        className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white shadow-lg"
                                        style={{ backgroundColor: theme.colorPalette.accent }}
                                    >
                                        MÁS POPULAR
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold mb-2">{ticket.name}</h3>
                                <div className="text-4xl font-bold mb-6" style={{ color: theme.colorPalette.primary }}>{ticket.price}</div>
                                <ul className="space-y-3 mb-8 text-left opacity-80">
                                    {ticket.benefits.map((benefit: string, j: number) => (
                                        <li key={j} className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span> {benefit}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className="w-full py-3 rounded-xl font-bold transition-colors"
                                    style={{
                                        backgroundColor: ticket.recommended ? theme.colorPalette.primary : '#f3f4f6',
                                        color: ticket.recommended ? '#ffffff' : '#000000'
                                    }}
                                >
                                    Comprar {ticket.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Logistics */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: theme.typography.headingFont }}>Ubicación & Horarios</h2>
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-gray-50 border">
                                <h3 className="font-bold text-lg mb-2">📍 {theme.content.logistics.venueName}</h3>
                                <p className="opacity-70">{theme.content.logistics.address}</p>
                            </div>
                            <div className="space-y-4">
                                {theme.content.logistics.schedule.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center border-b pb-2">
                                        <span className="font-mono font-bold opacity-60">{item.time}</span>
                                        <span className="font-medium">{item.activity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: theme.typography.headingFont }}>Preguntas Frecuentes</h2>
                        <div className="space-y-4">
                            {theme.content.logistics.faq.map((item: any, i: number) => (
                                <div key={i} className="collapse collapse-plus bg-gray-50 rounded-xl border">
                                    <input type="radio" name="my-accordion-3" defaultChecked={i === 0} />
                                    <div className="collapse-title text-lg font-medium">
                                        {item.question}
                                    </div>
                                    <div className="collapse-content opacity-80">
                                        <p>{item.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Social Proof */}
            <section className="py-16 px-6 text-center border-t border-black/5">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-8">{theme.content.socialProof.headline}</h3>
                <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale">
                    {/* Placeholders for logos */}
                    <div className="h-8 w-24 bg-current rounded" />
                    <div className="h-8 w-24 bg-current rounded" />
                    <div className="h-8 w-24 bg-current rounded" />
                    <div className="h-8 w-24 bg-current rounded" />
                </div>
            </section>

            {/* 6. Footer & Sticky CTA */}
            <footer className="py-12 px-6 bg-black text-white text-center">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: theme.typography.headingFont }}>{theme.content.hero.title}</h2>
                    <div className="flex justify-center gap-6">
                        {theme.content.footer.socials.map((social: any, i: number) => (
                            <span key={i} className="opacity-60 hover:opacity-100 cursor-pointer">{social.platform}</span>
                        ))}
                    </div>
                </div>
                <p className="opacity-40 text-sm">© 2024 {theme.content.hero.title}. All rights reserved.</p>
            </footer>

            {/* Sticky Mobile CTA */}
            <div className="sticky bottom-4 left-4 right-4 md:hidden z-50 px-4">
                <button
                    className="w-full py-4 rounded-full font-bold shadow-2xl text-lg animate-bounce-slow"
                    style={{
                        backgroundColor: theme.colorPalette.accent,
                        color: theme.colorPalette.background
                    }}
                >
                    {theme.content.hero.ctaText}
                </button>
            </div>
        </div>
    );
}
