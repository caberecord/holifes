import type { Config } from "@measured/puck";

// Componentes de Puck para eventos
import { EventHero } from "./components/Puck/EventHero";
import { EventDescription } from "./components/Puck/EventDescription";
import { SpeakerGrid } from "./components/Puck/SpeakerGrid";
import { FAQ } from "./components/Puck/FAQ";
import { MapLocation } from "./components/Puck/MapLocation";
import { VideoPlayer } from "./components/Puck/VideoPlayer";
import { VenueWidget } from "./components/Puck/VenueWidget";
import { SocialNetworks } from "./components/Puck/SocialNetworks";
import { Brands } from "./components/Puck/Brands";
import { TicketPricing } from "./components/Puck/TicketPricing";
import { PhotoCarousel } from "./components/Puck/PhotoCarousel";

// Campos personalizados
import { ImageUploadField } from "./components/Puck/Fields/ImageUploadField";
import { ColorPickerField } from "./components/Puck/Fields/ColorPickerField";

/**
 * Configuración de Puck para el constructor de sitios de eventos
 * 
 * Define los componentes disponibles en el editor visual y sus propiedades editables
 */

export type Props = {
    HeroEvento: {
        backgroundImage?: string;
        image?: string;
        title: string;
        subtitle?: string;
        showDate: boolean;
        showLocation: boolean;
        ctaText?: string;
        ctaLink?: string;
        showPaymentButton?: boolean;
        overlay: "none" | "light" | "dark";
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
    };
    DescripcionEvento: {
        title?: string;
        content: string;
        alignment: "left" | "center" | "right";
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
    };
    GrillaSpeakers: {
        title: string;
        columns: 2 | 3 | 4;
        showBio: boolean;
        showSocial: boolean;
        speakers?: any[];
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
    };
    PreguntasFrecuentes: {
        title: string;
        items: Array<{
            question: string;
            answer: string;
        }>;
    };
    MapaUbicacion: {
        showMap: boolean;
        showAddress: boolean;
        showDirections: boolean;
        mapZoom: number;
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
    };
    VideoPlayer: {
        url: string;
        title?: string;
    };
    VenueWidget: {
        // No props for now, reads from context
    };
    RedesSociales: {
        title?: string;
        links: Array<{
            platform: "twitter" | "linkedin" | "instagram" | "facebook" | "website" | "youtube" | "tiktok";
            url: string;
        }>;
        alignment: "left" | "center" | "right";
        iconSize?: number;
        iconColor?: string;
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
    };
    Marcas: {
        title?: string;
        brands: Array<{
            name: string;
            image: string;
            url?: string;
        }>;
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
    };
    PreciosBoleteria: {
        title?: string;
        showRemaining: boolean;
        lowStockThreshold: number;
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
    };
    CarruselFotos: {
        title?: string;
        images: Array<{
            url: string;
            alt?: string;
        }>;
        effect: "slide" | "coverflow";
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
    };
};

// Helper para campos de estilo comunes
const styleFields = {
    backgroundColor: {
        type: "custom" as const,
        label: "Color de Fondo",
        render: ({ value, onChange }: any) => (
            <ColorPickerField value={value} onChange={onChange} />
        ),
    },
    textColor: {
        type: "custom" as const,
        label: "Color de Texto",
        render: ({ value, onChange }: any) => (
            <ColorPickerField value={value} onChange={onChange} />
        ),
    },
    fontFamily: {
        type: "select" as const,
        label: "Tipografía",
        options: [
            { label: "Inter", value: "inter" },
            { label: "Montserrat", value: "montserrat" },
            { label: "Playfair Display", value: "playfair" },
            { label: "Oswald", value: "oswald" },
            { label: "Poppins", value: "poppins" },
            { label: "Merriweather", value: "merriweather" },
            { label: "Anton", value: "anton" },
            { label: "Cormorant Garamond", value: "cormorant" },
            { label: "Lilita One", value: "lilita" },
            { label: "Space Mono", value: "space" },
        ],
    },
};

export const config: Config<Props> = {
    root: {
        render: ({ children }) => {
            return <div id="puck-root">{children}</div>;
        },
    },
    components: {
        HeroEvento: {
            label: "Banner principal",
            fields: {
                ...styleFields,
                image: {
                    type: "custom",
                    label: "Imagen de Fondo (Subir)",
                    render: ({ value, onChange, field }) => (
                        <ImageUploadField value={value} onChange={onChange} label={field.label} />
                    ),
                },
                backgroundImage: {
                    type: "text",
                    label: "URL de Imagen de Fondo (Manual)",
                },
                title: {
                    type: "text",
                    label: "Título Principal",
                },
                subtitle: {
                    type: "textarea",
                    label: "Subtítulo",
                },
                showDate: {
                    type: "radio",
                    label: "Mostrar Fecha",
                    options: [
                        { label: "Sí", value: true },
                        { label: "No", value: false },
                    ],
                },
                showLocation: {
                    type: "radio",
                    label: "Mostrar Ubicación",
                    options: [
                        { label: "Sí", value: true },
                        { label: "No", value: false },
                    ],
                },
                ctaText: {
                    type: "text",
                    label: "Texto del Botón (CTA)",
                },
                ctaLink: {
                    type: "text",
                    label: "Enlace del Botón",
                },
                showPaymentButton: {
                    type: "radio",
                    label: "Mostrar Botón de Pago",
                    options: [
                        { label: "Sí", value: true },
                        { label: "No", value: false },
                    ],
                },
                overlay: {
                    type: "select",
                    label: "Overlay de Fondo",
                    options: [
                        { label: "Sin Overlay", value: "none" },
                        { label: "Overlay Claro", value: "light" },
                        { label: "Overlay Oscuro", value: "dark" },
                    ],
                },
            },
            defaultProps: {
                title: "Nombre del Evento",
                showDate: true,
                showLocation: true,
                showPaymentButton: false,
                overlay: "dark",
                backgroundColor: "",
                textColor: "",
                fontFamily: "modern",
            },
            render: (props) => (
                <EventHero {...props} />
            ),
        },
        DescripcionEvento: {
            label: "Descripción Evento",
            fields: {
                ...styleFields,
                title: {
                    type: "text",
                    label: "Título (opcional)",
                },
                content: {
                    type: "textarea",
                    label: "Descripción",
                },
                alignment: {
                    type: "select",
                    label: "Alineación",
                    options: [
                        { label: "Izquierda", value: "left" },
                        { label: "Centro", value: "center" },
                        { label: "Derecha", value: "right" },
                    ],
                },
            },
            defaultProps: {
                content: "Descripción del evento...",
                alignment: "left",
                backgroundColor: "",
                textColor: "",
                fontFamily: "modern",
            },
            render: (props) => (
                <EventDescription {...props} />
            ),
        },
        GrillaSpeakers: {
            label: "Artistas / Conferencistas",
            fields: {
                ...styleFields,
                title: {
                    type: "text",
                    label: "Título de la Sección",
                },
                columns: {
                    type: "select",
                    label: "Columnas",
                    options: [
                        { label: "2 Columnas", value: 2 },
                        { label: "3 Columnas", value: 3 },
                        { label: "4 Columnas", value: 4 },
                    ],
                },
                showBio: {
                    type: "radio",
                    label: "Mostrar Biografía",
                    options: [
                        { label: "Sí", value: true },
                        { label: "No", value: false },
                    ],
                },
                showSocial: {
                    type: "radio",
                    label: "Mostrar Redes Sociales",
                    options: [
                        { label: "Sí", value: true },
                        { label: "No", value: false },
                    ],
                },
                speakers: {
                    type: "array",
                    label: "Conferencistas",
                    arrayFields: {
                        name: { type: "text", label: "Nombre" },
                        title: { type: "text", label: "Título/Cargo" },
                        image: {
                            type: "custom",
                            label: "Foto",
                            render: ({ value, onChange, field }) => (
                                <ImageUploadField value={value} onChange={onChange} label={field.label} />
                            ),
                        },
                        bio: { type: "textarea", label: "Biografía" },
                        socialLinks: {
                            type: "array",
                            label: "Redes Sociales",
                            arrayFields: {
                                platform: {
                                    type: "select",
                                    label: "Plataforma",
                                    options: [
                                        { label: "Twitter", value: "twitter" },
                                        { label: "LinkedIn", value: "linkedin" },
                                        { label: "Instagram", value: "instagram" },
                                        { label: "Facebook", value: "facebook" },
                                        { label: "Website", value: "website" },
                                    ],
                                },
                                url: { type: "text", label: "URL" },
                            },
                        },
                    },
                },
            },
            defaultProps: {
                title: "Conferencistas",
                columns: 3,
                showBio: true,
                showSocial: true,
                speakers: [],
                backgroundColor: "",
                textColor: "",
                fontFamily: "modern",
            },
            render: (props) => (
                <SpeakerGrid {...props as any} />
            ),
        },
        PreguntasFrecuentes: {
            label: "Preguntas Frecuentes",
            fields: {
                title: {
                    type: "text",
                    label: "Título de la Sección",
                },
                items: {
                    type: "array",
                    label: "Preguntas Frecuentes",
                    arrayFields: {
                        question: {
                            type: "text",
                            label: "Pregunta",
                        },
                        answer: {
                            type: "textarea",
                            label: "Respuesta",
                        },
                    },
                    defaultItemProps: {
                        question: "¿Pregunta?",
                        answer: "Respuesta...",
                    },
                },
            },
            defaultProps: {
                title: "Preguntas Frecuentes",
                items: [],
            },
            render: ({ title, items }) => <FAQ title={title} items={items} />,
        },
        MapaUbicacion: {
            label: "Mapa / Ubicación",
            fields: {
                ...styleFields,
                showMap: {
                    type: "radio",
                    label: "Mostrar Mapa",
                    options: [
                        { label: "Sí", value: true },
                        { label: "No", value: false },
                    ],
                },
                showAddress: {
                    type: "radio",
                    label: "Mostrar Dirección",
                    options: [
                        { label: "Sí", value: true },
                        { label: "No", value: false },
                    ],
                },
                showDirections: {
                    type: "radio",
                    label: "Botón de Direcciones",
                    options: [
                        { label: "Sí", value: true },
                        { label: "No", value: false },
                    ],
                },
                mapZoom: {
                    type: "number",
                    label: "Zoom del Mapa",
                    min: 10,
                    max: 18,
                },
            },
            defaultProps: {
                showMap: true,
                showAddress: true,
                showDirections: true,
                mapZoom: 15,
                backgroundColor: "",
                textColor: "",
                fontFamily: "modern",
            },
            render: (props) => (
                <MapLocation {...props} />
            ),
        },
        VideoPlayer: {
            label: "Video",
            fields: {
                url: {
                    type: "text",
                    label: "URL del Video (YouTube/Vimeo)",
                },
                title: {
                    type: "text",
                    label: "Título (opcional)",
                },
            },
            defaultProps: {
                url: "",
            },
            render: (props) => (
                <VideoPlayer {...props} />
            ),
        },
        VenueWidget: {
            label: "Mapa de Asientos",
            fields: {},
            defaultProps: {},
            render: () => <VenueWidget />,
        },
        RedesSociales: {
            label: "Redes Sociales",
            fields: {
                ...styleFields,
                title: { type: "text", label: "Título (opcional)" },
                alignment: {
                    type: "select",
                    label: "Alineación",
                    options: [
                        { label: "Izquierda", value: "left" },
                        { label: "Centro", value: "center" },
                        { label: "Derecha", value: "right" },
                    ],
                },
                iconSize: {
                    type: "number",
                    label: "Tamaño de Iconos (px)",
                    min: 16,
                    max: 64,
                },
                iconColor: {
                    type: "text",
                    label: "Color de Iconos (Hex/Nombre)",
                },
                links: {
                    type: "array",
                    label: "Redes Sociales",
                    arrayFields: {
                        platform: {
                            type: "select",
                            label: "Plataforma",
                            options: [
                                { label: "Twitter", value: "twitter" },
                                { label: "LinkedIn", value: "linkedin" },
                                { label: "Instagram", value: "instagram" },
                                { label: "Facebook", value: "facebook" },
                                { label: "YouTube", value: "youtube" },
                                { label: "TikTok", value: "tiktok" },
                                { label: "Website", value: "website" },
                            ],
                        },
                        url: { type: "text", label: "URL" },
                    },
                },
            },
            defaultProps: {
                alignment: "center",
                iconSize: 24,
                iconColor: "#4B5563",
                links: [],
                backgroundColor: "",
                textColor: "",
                fontFamily: "modern",
            },
            render: (props) => <SocialNetworks {...props} />,
        },
        Marcas: {
            label: "Marcas / Patrocinadores",
            fields: {
                ...styleFields,
                title: { type: "text", label: "Título (opcional)" },
                brands: {
                    type: "array",
                    label: "Marcas / Patrocinadores",
                    arrayFields: {
                        name: { type: "text", label: "Nombre" },
                        image: {
                            type: "custom",
                            label: "Logo",
                            render: ({ value, onChange, field }) => (
                                <ImageUploadField value={value} onChange={onChange} label={field.label} />
                            ),
                        },
                        url: { type: "text", label: "Enlace (opcional)" },
                    },
                },
            },
            defaultProps: {
                brands: [],
                backgroundColor: "",
                textColor: "",
                fontFamily: "modern",
            },
            render: (props) => <Brands {...props} />,
        },
        PreciosBoleteria: {
            label: "Precios Boletería",
            fields: {
                ...styleFields,
                title: { type: "text", label: "Título de la Sección" },
                showRemaining: {
                    type: "radio",
                    label: "Mostrar Boletos Restantes",
                    options: [
                        { label: "Sí", value: true },
                        { label: "No", value: false },
                    ],
                },
                lowStockThreshold: {
                    type: "number",
                    label: "Umbral de 'Casi Agotado'",
                },
            },
            defaultProps: {
                title: "Entradas",
                showRemaining: true,
                lowStockThreshold: 10,
                backgroundColor: "",
                textColor: "",
                fontFamily: "inter",
            },
            render: (props) => (
                <TicketPricing {...props} />
            ),
        },
        CarruselFotos: {
            label: "Carrusel de Fotos",
            fields: {
                ...styleFields,
                title: { type: "text", label: "Título de la Sección" },
                effect: {
                    type: "select",
                    label: "Efecto de Transición",
                    options: [
                        { label: "Deslizamiento (Slide)", value: "slide" },
                        { label: "Cover Flow (3D)", value: "coverflow" },
                    ],
                },
                images: {
                    type: "array",
                    label: "Imágenes",
                    arrayFields: {
                        url: {
                            type: "custom",
                            label: "Imagen",
                            render: ({ value, onChange, field }) => (
                                <ImageUploadField value={value} onChange={onChange} label={field.label} />
                            ),
                        },
                        alt: { type: "text", label: "Descripción (Alt)" },
                    },
                },
            },
            defaultProps: {
                title: "Galería",
                effect: "coverflow",
                images: [],
                backgroundColor: "",
                textColor: "",
                fontFamily: "inter",
            },
            render: (props) => (
                <PhotoCarousel {...props} />
            ),
        },
    },
};

export default config;
