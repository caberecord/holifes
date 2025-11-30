'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePuck, Puck, createUsePuck } from '@measured/puck';
import '@measured/puck/puck.css';
import { config } from '@/puck.config';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { EventContextProvider } from '@/lib/context/EventContext';

// Helper para generar IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Layout por defecto con componentes básicos (en Español)
function getDefaultLayout() {
    return {
        content: [
            {
                type: 'HeroEvento',
                props: {
                    id: generateId(),
                    title: 'Nombre de tu Evento',
                    subtitle: 'Descripción breve del evento',
                    showDate: true,
                    showLocation: true,
                    ctaText: 'Comprar Entradas',
                    overlay: 'dark',
                },
            },
            {
                type: 'DescripcionEvento',
                props: {
                    id: generateId(),
                    title: 'Acerca del Evento',
                    content: 'Agrega aquí la descripción completa de tu evento...',
                    alignment: 'left',
                },
            },
        ],
        root: {
            props: {
                title: 'Mi Evento',
            },
        },
    };
}

// Create a typed hook for Puck selectors
const usePuckSelector = createUsePuck();

// Componente Header interno que usa el contexto de Puck
const BuilderHeader = ({
    onSave,
    saving,
    eventId,
    router
}: {
    onSave: (data: any, publish?: boolean) => void;
    saving: boolean;
    eventId: string;
    router: any;
}) => {
    // Usamos el selector para obtener solo lo necesario y evitar re-renders
    const appState = usePuckSelector((state: any) => state.appState);

    return (
        <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-24">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push(`/dashboard/edit/${eventId}`)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-medium hidden sm:inline">Volver</span>
                </button>
                <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                <h1 className="text-xl font-bold text-gray-900 truncate">Constructor</h1>
            </div>

            <div className="flex items-center gap-3 ml-auto">
                <button
                    onClick={() => router.push(`/dashboard/events/${eventId}/templates`)}
                    className="mr-2 text-sm text-orange-700 bg-orange-100 hover:bg-orange-200 font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Cambiar Plantilla
                </button>

                <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>

                <button
                    onClick={() => onSave(appState.data, false)}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                >
                    {saving ? 'Guardando...' : 'Guardar borrador'}
                </button>
                <button
                    onClick={() => onSave(appState.data, true)}
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Publicando...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Publicar
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default function BuilderV2Page() {
    const [initialData, setInitialData] = useState<any>(getDefaultLayout());
    const [eventData, setEventData] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const params = useParams();
    const eventId = params?.id as string;

    // Cargar evento y layout
    useEffect(() => {
        if (!eventId) return;

        async function loadData() {
            try {
                // Cargar datos del evento
                const eventRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                    const event = { id: eventSnap.id, ...eventSnap.data() } as Event;
                    setEventData(event);

                    // Cargar layout si existe
                    if (event.layout_data) {
                        setInitialData(event.layout_data);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Error al cargar los datos del evento');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [eventId]);

    // Guardar layout - Memoizado para evitar recreación en cada render
    const handleSave = useCallback(async (data: any, publish: boolean = false) => {
        if (!eventId) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/events/${eventId}/layout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    layout_data: data,
                    publish: publish
                }),
            });

            if (response.ok) {
                toast.success(publish ? '¡Sitio publicado exitosamente!' : '¡Borrador guardado exitosamente!');
            } else {
                const error = await response.json();
                toast.error(error.message || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving layout:', error);
            toast.error('Error al guardar el diseño');
        } finally {
            setSaving(false);
        }
    }, [eventId]);

    // Memoizar overrides para evitar re-renders innecesarios de Puck
    const overrides = useMemo(() => ({
        header: () => (
            <BuilderHeader
                onSave={handleSave}
                saving={saving}
                eventId={eventId}
                router={router}
            />
        ),
        drawer: ({ children }: { children: React.ReactNode }) => (
            <div>
                <h3 className="text-lg font-bold mb-4 px-4">Componentes</h3>
                {children}
            </div>
        ),
    }), [handleSave, saving, eventId, router]);

    if (!eventId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">ID de evento no encontrado</p>
            </div>
        );
    }

    if (loading || !eventData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <EventContextProvider event={eventData}>
            <div className="h-screen">
                {/* Puck Editor */}
                <Puck
                    config={config}
                    data={initialData}
                    onPublish={handleSave}
                    overrides={overrides}
                />
            </div>
        </EventContextProvider >
    );
}
