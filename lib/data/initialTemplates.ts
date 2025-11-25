export const INITIAL_TEMPLATES = [
    {
        id: 'concert-dark-v1',
        name: 'Concierto Dark Mode',
        description: 'Diseño oscuro y vibrante ideal para conciertos, festivales y eventos nocturnos.',
        category: 'concert',
        thumbnailUrl: 'https://images.unsplash.com/photo-1459749411177-3c2ea8156daa?q=80&w=2070&auto=format&fit=crop',
        is_active: true,
        layout_data: {
            content: [
                {
                    type: 'HeroEvento',
                    props: {
                        id: 'hero-1',
                        subtitle: 'WORLD TOUR 2025',
                        showDate: true,
                        showLocation: true,
                        ctaLink: '#tickets',
                        overlay: 'dark',
                        fontFamily: 'anton',
                        textColor: '#ffffff',
                        backgroundColor: '#000000'
                    }
                },
                {
                    type: 'DescripcionEvento',
                    props: {
                        id: 'desc-1',
                        title: 'SOBRE EL TOUR',
                        content: 'Prepárate para la experiencia musical más impactante del año. Un espectáculo de luces y sonido que no olvidarás.',
                        alignment: 'center',
                        backgroundColor: '#111111',
                        textColor: '#ffffff'
                    }
                },
                {
                    type: 'TicketPricing',
                    props: {
                        id: 'tickets-1',
                        title: 'ENTRADAS',
                        showRemaining: true,
                        lowStockThreshold: 20,
                        showBuyButton: true,
                        buyButtonText: 'COMPRAR TICKETS',
                        backgroundColor: '#000000',
                        textColor: '#ffffff'
                    }
                },
                {
                    type: 'VenueWidget',
                    props: {
                        id: 'venue-1'
                    }
                }
            ],
            root: { props: { title: 'Concierto Template' } }
        }
    },
    {
        id: 'conference-clean-v1',
        name: 'Conferencia Profesional',
        description: 'Diseño limpio y corporativo para congresos, seminarios y eventos empresariales.',
        category: 'conference',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop',
        is_active: true,
        layout_data: {
            content: [
                {
                    type: 'HeroEvento',
                    props: {
                        id: 'hero-2',
                        subtitle: 'Innovación y Futuro',
                        showDate: true,
                        showLocation: true,
                        ctaLink: '#register',
                        overlay: 'light',
                        fontFamily: 'inter',
                        textColor: '#1a1a1a',
                        backgroundColor: '#ffffff'
                    }
                },
                {
                    type: 'DescripcionEvento',
                    props: {
                        id: 'agenda-1',
                        title: 'Agenda',
                        content: 'Dos días de conferencias inspiradoras, networking y talleres prácticos con líderes de la industria.',
                        alignment: 'left',
                        backgroundColor: '#ffffff'
                    }
                },
                {
                    type: 'TicketPricing',
                    props: {
                        id: 'tickets-2',
                        title: 'Pases de Acceso',
                        showRemaining: false,
                        showBuyButton: true,
                        buyButtonText: 'Registrarse Ahora',
                        backgroundColor: '#ffffff'
                    }
                }
            ],
            root: { props: { title: 'Conference Template' } }
        }
    }
];
