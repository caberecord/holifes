"use client";
import { useState, useEffect } from "react";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { AppUser } from "../../../types/user";
import { X } from "lucide-react";
import { showToast } from "@/lib/toast";

interface EditStaffModalProps {
    staff: AppUser;
    organizerId: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface Event {
    id: string;
    name: string;
}

export default function EditStaffModal({ staff, organizerId, onClose, onSuccess }: EditStaffModalProps) {
    const [assignedEvents, setAssignedEvents] = useState<string[]>(staff.assignedEvents || []);
    const [canViewDetails, setCanViewDetails] = useState(staff.permissions?.canViewAttendeeDetails || false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const q = query(
                collection(db, "events"),
                where("organizerId", "==", organizerId)
            );
            const querySnapshot = await getDocs(q);
            const eventList: Event[] = [];
            querySnapshot.forEach((doc) => {
                eventList.push({
                    id: doc.id,
                    name: doc.data().name,
                });
            });
            setEvents(eventList);
        } catch (error) {
            console.error("Error loading events:", error);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            await updateDoc(doc(db, "users", staff.uid), {
                assignedEvents,
                permissions: {
                    canViewAttendeeDetails: canViewDetails,
                    canExportData: false,
                },
            });

            showToast.success("Personal actualizado exitosamente");
            onSuccess();
        } catch (error) {
            console.error("Error updating staff:", error);
            showToast.error("Error al actualizar el personal");
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleEvent = (eventId: string) => {
        setAssignedEvents((prev) =>
            prev.includes(eventId)
                ? prev.filter((id) => id !== eventId)
                : [...prev, eventId]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Editar Personal</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="p-6 space-y-6">
                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={staff.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            El email no puede ser modificado
                        </p>
                    </div>

                    {/* Assigned Events */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Eventos Asignados
                        </label>
                        {loadingEvents ? (
                            <p className="text-sm text-gray-500">Cargando eventos...</p>
                        ) : events.length === 0 ? (
                            <p className="text-sm text-gray-500">No tienes eventos creados</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                {events.map((event) => (
                                    <label
                                        key={event.id}
                                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={assignedEvents.includes(event.id)}
                                            onChange={() => toggleEvent(event.id)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-900">{event.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Selecciona los eventos a los que este personal tendrá acceso
                        </p>
                    </div>

                    {/* Permissions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Permisos
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    checked={canViewDetails}
                                    onChange={(e) => setCanViewDetails(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Ver Detalles de Asistentes
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Permite ver nombre completo y datos de contacto
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? "Actualizando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
