"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event } from "@/types/event";
import { Search, Calendar, MapPin, DollarSign } from "lucide-react";

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            // As Super Admin, we can query all events thanks to security rules
            const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const eventsData: Event[] = [];
            snapshot.forEach((doc) => {
                eventsData.push({ id: doc.id, ...doc.data() } as Event);
            });
            setEvents(eventsData);
        } catch (error) {
            console.error("Error loading events:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Auditoría de Eventos</h1>
                    <p className="text-gray-400">Visión global de todos los eventos en la plataforma.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar evento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center text-gray-400 py-12">Cargando eventos...</div>
                ) : filteredEvents.map((event) => (
                    <div key={event.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-white line-clamp-1">{event.name}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${event.status === 'published' ? 'bg-green-900/30 text-green-400' :
                                event.status === 'draft' ? 'bg-yellow-900/30 text-yellow-400' :
                                    'bg-gray-700 text-gray-400'
                                }`}>
                                {event.status}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-400 mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Plan: {event.plan || 'Freemium'}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-700 flex justify-between items-center text-sm">
                            <span className="text-gray-500">ID: {event.id?.substring(0, 8)}...</span>
                            <button className="text-indigo-400 hover:text-indigo-300 font-medium">
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
