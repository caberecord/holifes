"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { Event } from "../../types/event";
import Link from "next/link";
import { Ticket, Users, Calendar, Plus } from "lucide-react";

export default function EventList() {
    const { user, appUser } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !appUser) return;

        // Determine the correct organizerId (Staff uses their creator's ID)
        const organizerId = appUser.role === 'staff' && appUser.createdBy
            ? appUser.createdBy
            : user.uid;

        const q = query(
            collection(db, "events"),
            where("organizerId", "==", organizerId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData: Event[] = [];
            snapshot.forEach((doc) => {
                eventsData.push({ id: doc.id, ...doc.data() } as Event);
            });
            setEvents(eventsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, appUser]);

    if (loading) {
        return <div className="text-gray-400">Cargando eventos...</div>;
    }

    if (events.length === 0) {
        const styles = `
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(50px) rotate(0deg); }
            to   { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
          }
          .animate-orbit {
            animation: orbit 10s linear infinite;
          }
          .animate-orbit-delay {
            animation-delay: -5s;
          }
        `;

        return (
            <>
                <style>{styles}</style>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                    {/* Decoración de fondo sutil */}
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-indigo-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-purple-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center justify-center py-10 px-4 text-center max-w-lg mx-auto">

                        {/* Icono Ilustrativo Animado */}
                        <div className="mb-4 relative group cursor-pointer">
                            <Link href="/dashboard/create">
                                {/* Contenedor para los iconos en órbita */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                    {/* Icono Ticket en órbita */}
                                    <div className="absolute bg-white p-1.5 rounded-lg shadow-md border border-gray-100 animate-orbit">
                                        <Ticket size={16} className="text-orange-500" />
                                    </div>
                                    {/* Icono Usuarios en órbita (con retraso para posición opuesta) */}
                                    <div className="absolute bg-white p-1.5 rounded-lg shadow-md border border-gray-100 animate-orbit animate-orbit-delay">
                                        <Users size={16} className="text-green-500" />
                                    </div>
                                </div>

                                {/* Icono Principal (Calendario) */}
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-300">
                                    <Calendar size={32} className="text-indigo-600" />
                                </div>
                            </Link>
                        </div>

                        {/* Textos Mejorados */}
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                            Comienza tu primer evento
                        </h2>
                        <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-sm">
                            Aún no tienes eventos activos. Crea uno nuevo para empezar a gestionar asistentes, vender entradas y controlar el acceso.
                        </p>

                        {/* Botón de Acción Principal (Grande) */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                            <Link
                                href="/dashboard/create"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:shadow-indigo-200 transition-all transform hover:-translate-y-1 text-sm"
                            >
                                <Plus size={18} />
                                Crear Nuevo Evento
                            </Link>

                            {/* Botón Secundario */}
                            <button className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-sm">
                                Ver tutorial rápido
                            </button>
                        </div>

                        {/* Feature Pills */}
                        <div className="mt-8 pt-6 border-t border-gray-50 w-full flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Pagos Seguros</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> QR Check-in</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Analíticas en tiempo real</span>
                        </div>

                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Evento
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Fecha
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Ubicación
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Estado
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Gestionar</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {event.name || event.title}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {new Date(event.date).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{event.location}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-800' :
                                    event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {event.status === 'published' ? 'Publicado' : event.status === 'draft' ? 'Borrador' : event.status || 'Borrador'}
                                </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <Link
                                    href={`/dashboard/edit/${event.id}`}
                                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
                                >
                                    Gestionar
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
