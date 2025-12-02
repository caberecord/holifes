"use client";

import { useEffect, useState } from "react";
import { useEventContext } from "@/lib/context/EventContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Globe, Mail, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface FooterProps {
    backgroundColor?: string;
    textColor?: string;
    links?: Array<{
        label: string;
        url: string;
    }>;
}

interface OrganizerProfile {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    companyName?: string;
    bio?: string;
    website?: string;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
        youtube?: string;
    };
    isCompany?: boolean;
}

export function Footer({
    backgroundColor = "#111827",
    textColor = "#F3F4F6",
    links = []
}: FooterProps) {
    const event = useEventContext();
    const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrganizer = async () => {
            // Try to get organization first, fallback to user if no organization
            const orgId = event?.organizationId || event?.organizerId;
            if (!orgId) return;

            try {
                // Try organization first
                if (event?.organizationId) {
                    const orgDoc = await getDoc(doc(db, "organizations", event.organizationId));
                    if (orgDoc.exists()) {
                        const orgData = orgDoc.data();
                        setOrganizer({
                            displayName: orgData.name,
                            companyName: orgData.name,
                            email: orgData.contactEmail,
                            phoneNumber: orgData.phone,
                            photoURL: orgData.logo,
                            bio: orgData.description,
                            website: orgData.website,
                            socialLinks: orgData.socialLinks,
                            isCompany: true,
                        });
                        setLoading(false);
                        return;
                    }
                }

                // Fallback to user if no organization
                if (event?.organizerId) {
                    const userDoc = await getDoc(doc(db, "users", event.organizerId));
                    if (userDoc.exists()) {
                        setOrganizer(userDoc.data() as OrganizerProfile);
                    }
                }
            } catch (error) {
                console.error("Error fetching organizer/organization:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizer();
    }, [event?.organizerId, event?.organizationId]);

    if (!event) return null;

    const currentYear = new Date().getFullYear();
    const displayName = organizer?.companyName || organizer?.displayName || "Organizador del Evento";

    return (
        <footer
            className="py-12 px-4 md:px-8"
            style={{ backgroundColor, color: textColor }}
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Columna 1: Información del Organizador */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-2">Organizado por</h3>
                    <div className="flex items-center gap-3">
                        {organizer?.photoURL && (
                            <Image
                                src={organizer.photoURL}
                                alt={displayName}
                                width={48}
                                height={48}
                                className="rounded-full object-cover border-2 border-white/10"
                            />
                        )}
                        <div>
                            <p className="font-semibold text-lg">{displayName}</p>
                            {organizer?.email && (
                                <p className="text-sm opacity-80 flex items-center gap-2 mt-1">
                                    <Mail size={14} /> {organizer.email}
                                </p>
                            )}
                        </div>
                    </div>
                    {organizer?.bio && (
                        <p className="text-sm opacity-70 mt-2 max-w-xs">
                            {organizer.bio}
                        </p>
                    )}
                </div>

                {/* Columna 2: Enlaces Rápidos (Custom Fields) */}
                <div className="space-y-4">
                    {links.length > 0 && (
                        <>
                            <h3 className="text-lg font-bold mb-2">Enlaces de Interés</h3>
                            <ul className="space-y-2">
                                {links.map((link, idx) => (
                                    <li key={idx}>
                                        <Link
                                            href={link.url}
                                            target="_blank"
                                            className="hover:underline opacity-80 hover:opacity-100 transition-opacity flex items-center gap-2"
                                        >
                                            <Globe size={14} />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {/* Columna 3: Redes Sociales y Contacto */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-2">Contacto</h3>
                    <div className="space-y-2 text-sm opacity-80">
                        {organizer?.phoneNumber && (
                            <p className="flex items-center gap-2">
                                <Phone size={14} /> {organizer.phoneNumber}
                            </p>
                        )}
                        {organizer?.website && (
                            <p className="flex items-center gap-2">
                                <Globe size={14} />
                                <a href={organizer.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    Sitio Web
                                </a>
                            </p>
                        )}
                    </div>

                    {/* Redes Sociales del Organizador */}
                    {organizer?.socialLinks && (
                        <div className="flex gap-4 mt-4">
                            {organizer.socialLinks.facebook && (
                                <a href={organizer.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                    <Facebook size={20} />
                                </a>
                            )}
                            {organizer.socialLinks.twitter && (
                                <a href={organizer.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                    <Twitter size={20} />
                                </a>
                            )}
                            {organizer.socialLinks.instagram && (
                                <a href={organizer.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                                    <Instagram size={20} />
                                </a>
                            )}
                            {organizer.socialLinks.linkedin && (
                                <a href={organizer.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {organizer.socialLinks.youtube && (
                                <a href={organizer.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                                    <Youtube size={20} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-white/10 mt-12 pt-8 flex flex-col items-center justify-center gap-4">
                <p className="text-sm opacity-60">
                    hecho con
                </p>
                <a
                    href="https://www.holifes.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-80"
                >
                    <Image
                        src="/logo_blanco_holifes.png"
                        alt="Holifes"
                        width={120}
                        height={32}
                        className="h-8 w-auto"
                        style={{ width: 'auto', height: '32px' }}
                    />
                </a>
            </div>
        </footer>
    );
}
