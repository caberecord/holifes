"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { Event } from "../../../../types/event";
import EventHeader from "../../../../components/Dashboard/EventManagement/EventHeader";
import TabMetrics from "../../../../components/Dashboard/EventManagement/TabMetrics";
import TabAttendees from "../../../../components/Dashboard/EventManagement/TabAttendees";
import TabConfig from "../../../../components/Dashboard/EventManagement/TabConfig";
import { Settings, Users, BarChart3, Share2, Ticket, Globe } from "lucide-react";

export default function EditEventPage() {
    const params = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("metrics");

    useEffect(() => {
        const fetchEvent = async () => {
            if (!params.id) return;
            try {
                const docRef = doc(db, "events", params.id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() } as Event);
                }
            } catch (err) {
                console.error("Error fetching event:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [params.id]);

    if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Cargando evento...</div>;
    if (!event) return <div className="flex items-center justify-center h-screen text-gray-500">Evento no encontrado</div>;

    const tabs = [
        { id: "metrics", label: "Métricas", icon: BarChart3 },
        { id: "attendees", label: "Tickets y Asistentes", icon: Ticket },
        { id: "config", label: "Configuración", icon: Settings },
        { id: "website", label: "Sitio Web", icon: Globe },
        { id: "integrations", label: "Integraciones", icon: Share2 },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <EventHeader event={event} />

            {/* Main Tabs Navigation */}
            <div className="bg-white border-b border-gray-200 px-6">
                <div className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-4 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {activeTab === "metrics" && <TabMetrics event={event} />}
                {activeTab === "attendees" && <TabAttendees event={event} />}
                {activeTab === "config" && <TabConfig event={event} />}
                {activeTab === "integrations" && (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200">
                        <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900">Integraciones</h3>
                        <p>Próximamente: Conecta con herramientas externas.</p>
                    </div>
                )}
                {activeTab === "website" && (
                    <div className="bg-white rounded-xl border border-gray-200 p-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Micrositio del Evento</h2>
                                <p className="text-gray-500 max-w-xl">
                                    Crea una página web profesional para tu evento con un subdominio personalizado (ej. <strong>{event.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.holifes.com</strong>).
                                    Usa nuestra IA para generar el diseño y contenido en segundos.
                                </p>

                                {event.microsite?.enabled && (
                                    <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-green-900">¡Sitio Publicado!</h4>
                                            <p className="text-xs text-green-700 mt-1">
                                                Tu evento está visible en:
                                            </p>
                                            <a
                                                href={`http://${event.microsite.subdomain}.holifes.com`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-bold text-green-700 hover:underline mt-1 block"
                                            >
                                                {event.microsite.subdomain}.holifes.com
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 w-full md:w-auto">
                                <a
                                    href={`/dashboard/events/${event.id}/builder`}
                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Globe className="w-5 h-5 mr-2" />
                                    {event.microsite?.enabled ? "Editar Sitio" : "Diseñar Sitio Web"}
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
