"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { createStaffUser, generateSecurePassword } from "../../../lib/auth/roles";
import { Event } from "../../../types/event";
import { showToast } from "@/lib/toast";

interface CreateStaffModalProps {
    organizerId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateStaffModal({ organizerId, onClose, onSuccess }: CreateStaffModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [canViewDetails, setCanViewDetails] = useState(false);
    const [canSell, setCanSell] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        // Generate password on mount
        setPassword(generateSecurePassword());
        loadOrganizerEvents();
    }, []);

    const loadOrganizerEvents = async () => {
        try {
            const q = query(
                collection(db, "events"),
                where("organizerId", "==", organizerId)
            );
            const querySnapshot = await getDocs(q);
            const eventsList: Event[] = [];
            querySnapshot.forEach((doc) => {
                eventsList.push({ id: doc.id, ...doc.data() } as Event);
            });
            setEvents(eventsList);
        } catch (error) {
            console.error("Error loading events:", error);
        } finally {
            setLoadingEvents(false);
        }
    };

    const toggleEvent = (eventId: string) => {
        setSelectedEvents(prev =>
            prev.includes(eventId)
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            showToast.error("Email y contraseña son requeridos");
            return;
        }

        if (selectedEvents.length === 0) {
            showToast.error("Debes asignar al menos un evento");
            return;
        }

        setLoading(true);
        try {
            await createStaffUser(
                email,
                password,
                selectedEvents,
                organizerId,
                {
                    canViewAttendeeDetails: canViewDetails,
                    canExportData: false,
                    canSell: canSell,
                }
            );

            // Send credentials email via API route
            try {
                const response = await fetch('/api/send-staff-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        eventIds: selectedEvents,
                    }),
                });

                if (response.ok) {
                    showToast.success(`Staff creado exitosamente! Se han enviado las credenciales a ${email}`);
                } else {
                    showToast.warning(`Staff creado pero el email falló. Credenciales: ${email} / ${password} (guárdalas)`);
                }
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                showToast.warning(`Staff creado pero el email falló. Credenciales: ${email} / ${password} (guárdalas)`);
            }

            onSuccess();
        } catch (error: any) {
            console.error("Error creating staff:", error);
            showToast.error(`Error al crear staff: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const regeneratePassword = () => {
        setPassword(generateSecurePassword());
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Staff</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="staff@ejemplo.com"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña Temporal *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                                required
                                readOnly
                            />
                            <button
                                type="button"
                                onClick={regeneratePassword}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                            >
                                Regenerar
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Esta contraseña se enviará por email al staff
                        </p>
                    </div>

                    {/* Events Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Eventos Asignados * ({selectedEvents.length} seleccionados)
                        </label>
                        {loadingEvents ? (
                            <div className="text-sm text-gray-500">Cargando eventos...</div>
                        ) : events.length === 0 ? (
                            <div className="text-sm text-gray-500">No tienes eventos creados</div>
                        ) : (
                            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                                {events.map((event) => (
                                    <label
                                        key={event.id}
                                        className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedEvents.includes(event.id!)}
                                            onChange={() => toggleEvent(event.id!)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="ml-3 text-sm text-gray-900">
                                            {event.name || event.title}
                                        </span>
                                        <span className="ml-auto text-xs text-gray-500">
                                            {event.date}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Permissions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Permisos
                        </label>
                        <div className="space-y-4">
                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={canViewDetails}
                                    onChange={(e) => setCanViewDetails(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <div className="ml-3">
                                    <span className="text-sm font-medium text-gray-900">
                                        Puede ver detalles de asistentes
                                    </span>
                                    <p className="text-xs text-gray-500">
                                        Si está desactivado, solo podrá validar tickets sin ver información personal
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={canSell}
                                    onChange={(e) => setCanSell(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <div className="ml-3">
                                    <span className="text-sm font-medium text-gray-900">
                                        Acceso a Punto de Venta (POS)
                                    </span>
                                    <p className="text-xs text-gray-500">
                                        Permite vender entradas y cobrar en el evento
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>📧 Envío Automático:</strong> Las credenciales se enviarán automáticamente al email del staff con instrucciones de acceso.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || selectedEvents.length === 0}
                        >
                            {loading ? "Creando..." : "Crear Staff"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
