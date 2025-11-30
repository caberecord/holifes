"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Contact } from "@/types/contact";
import { Plus, Search, User, Mail, Phone, MapPin, ChevronRight, Loader2, X, Ticket, Calendar } from "lucide-react";
import Link from "next/link";
import ContactForm from "@/components/Contacts/ContactForm";

export default function ContactsPage() {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const loadContacts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, "contacts"),
                where("organizerId", "==", user.uid),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
            setContacts(data);
        } catch (error) {
            console.error("Error loading contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, [user]);

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.identification.number.includes(searchTerm)
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Search */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>

                {/* Create Button */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Contacto
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
                    <p className="text-gray-500">Cargando contactos...</p>
                </div>
            ) : filteredContacts.length === 0 ? (
                <>
                    <style>{`
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
                    `}</style>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                        {/* Decoración de fondo sutil */}
                        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-indigo-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-purple-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center justify-center py-10 px-4 text-center max-w-lg mx-auto">

                            {/* Icono Ilustrativo Animado */}
                            <div className="mb-4 relative group cursor-pointer" onClick={() => setShowCreateModal(true)}>
                                {/* Contenedor para los iconos en órbita */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                    {/* Icono Ticket en órbita */}
                                    <div className="absolute bg-white p-1.5 rounded-lg shadow-md border border-gray-100 animate-orbit">
                                        <Ticket size={16} className="text-orange-500" />
                                    </div>
                                    {/* Icono Calendario en órbita */}
                                    <div className="absolute bg-white p-1.5 rounded-lg shadow-md border border-gray-100 animate-orbit animate-orbit-delay">
                                        <Calendar size={16} className="text-green-500" />
                                    </div>
                                </div>

                                {/* Icono Principal (Usuario) */}
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-300">
                                    <User size={32} className="text-indigo-600" />
                                </div>
                            </div>

                            {/* Textos Mejorados */}
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                Comienza tu lista de contactos
                            </h2>
                            <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-sm">
                                Aún no tienes contactos registrados. Agrega uno nuevo para gestionar tus clientes y asistentes.
                            </p>

                            {/* Botón de Acción Principal (Grande) */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:shadow-indigo-200 transition-all transform hover:-translate-y-1 text-sm"
                                >
                                    <Plus size={18} />
                                    Nuevo Contacto
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                    Nombre
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Contacto
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Identificación
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Ubicación
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Ver</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredContacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{contact.name}</p>
                                                <p className="text-xs text-gray-500">Registrado: {contact.createdAt?.toDate ? contact.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3" />
                                                {contact.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3" />
                                                {contact.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {contact.identification.type} {contact.identification.number}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {contact.address?.city && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {contact.address.city}
                                            </div>
                                        )}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <Link href={`/dashboard/contacts/${contact.id}`} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all">
                                            Ver Detalles
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}



            {/* Create Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900">Nuevo Contacto</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <ContactForm
                                    onSuccess={() => {
                                        setShowCreateModal(false);
                                        loadContacts();
                                    }}
                                    onCancel={() => setShowCreateModal(false)}
                                />
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
