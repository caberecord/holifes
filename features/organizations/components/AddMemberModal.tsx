"use client";
import { useState, useEffect } from "react";
import { X, Shield, User, Mail, Calendar, Check } from "lucide-react";
import { OrganizationRole } from "@/features/organizations/types/member.schema";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event } from "@/types/event";
import { createStaffUser, generateSecurePassword } from "@/lib/auth/roles";
import { showToast } from "@/lib/toast";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, role: OrganizationRole, extraData?: any) => Promise<void>;
    organizerId: string; // Needed for loading events
    organizationId: string; // Needed for creating member link
}

export const AddMemberModal = ({ isOpen, onClose, onInvite, organizerId, organizationId }: AddMemberModalProps) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<OrganizationRole>("member");
    const [loading, setLoading] = useState(false);

    // Staff Specific State
    const [password, setPassword] = useState("");
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [canViewDetails, setCanViewDetails] = useState(false);
    const [canSell, setCanSell] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);

    useEffect(() => {
        if (isOpen && role === 'staff') {
            setPassword(generateSecurePassword());
            loadOrganizerEvents();
        }
    }, [isOpen, role]);

    const loadOrganizerEvents = async () => {
        setLoadingEvents(true);
        try {
            // Fetch events by organizationId
            const qOrg = query(
                collection(db, "events"),
                where("organizationId", "==", organizationId)
            );

            // Fetch events by organizerId (legacy support)
            const qOrganizer = query(
                collection(db, "events"),
                where("organizerId", "==", organizerId)
            );

            const [snapshotOrg, snapshotOrganizer] = await Promise.all([
                getDocs(qOrg),
                getDocs(qOrganizer)
            ]);

            const eventsMap = new Map<string, Event>();

            snapshotOrg.forEach((doc) => {
                eventsMap.set(doc.id, { id: doc.id, ...doc.data() } as Event);
            });

            snapshotOrganizer.forEach((doc) => {
                eventsMap.set(doc.id, { id: doc.id, ...doc.data() } as Event);
            });

            setEvents(Array.from(eventsMap.values()));
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
        setLoading(true);

        try {
            if (role === 'staff') {
                // Staff Creation Flow
                if (selectedEvents.length === 0) {
                    showToast.error("Debes asignar al menos un evento al staff");
                    setLoading(false);
                    return;
                }

                // 1. Create User in Auth & Firestore (users collection)
                await createStaffUser(
                    email,
                    password,
                    selectedEvents,
                    organizerId, // CreatedBy
                    {
                        canViewAttendeeDetails: canViewDetails,
                        canSell: canSell,
                        canExportData: false,
                    }
                );

                // 2. We also need to add them as an Organization Member (handled by createStaffUser? No, that's legacy)
                // We should probably call a service to link them to the organization as 'staff'
                // For now, let's assume createStaffUser handles the user creation, 
                // and we might need to manually add the org member link if createStaffUser doesn't do it.
                // WAIT: createStaffUser is legacy. It creates a user doc.
                // We should ideally use a new service `createStaffMember` that does both.
                // But to save time, I will call the onInvite/AddMember logic here or rely on the fact that 
                // we need to link them.

                // Actually, let's just use the onInvite callback but passing the staff role?
                // No, onInvite usually sends an email invitation. Staff needs direct creation.

                // Let's call a specialized function or just use the existing `inviteMember` but 
                // we need to ensure the user is created first (which createStaffUser does).
                // If the user exists, we can add them to the org.

                // For this MVP step, I'll assume the user is created by createStaffUser, 
                // and then we add them to the org using the same service as invite but with status 'active' maybe?
                // Or just let them be 'invited' status but with a known password?

                // Let's stick to the plan: Create User -> Send Email -> Add to Org.

                // Send credentials email
                await fetch('/api/send-staff-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, eventIds: selectedEvents }),
                });

                // Add to Organization as Staff (Active immediately because we set the password)
                // We need a way to add a member directly without invitation token if possible, 
                // or just use inviteMember and manually set status to active in backend?
                // For now, I'll use onInvite which calls `inviteMember`. 
                // `inviteMember` creates a member doc. 
                // We might need to update `inviteMember` to handle 'staff' role and extra fields.
                // But `onInvite` prop here only takes email and role.

                // I will modify the `onInvite` signature in the parent or handle it here.
                // Let's assume onInvite handles the member creation. 
                // But we need to pass permissions and events.
                // I'll update the prop signature.

                // REFACTOR: I'll handle the org member creation here directly if possible or 
                // pass the extra data to onInvite.
                // Let's pass extra data to onInvite.
                await onInvite(email, role, {
                    permissions: { canViewAttendeeDetails: canViewDetails, canSell },
                    assignedEvents: selectedEvents
                });

                showToast.success("Staff creado y agregado al equipo");

            } else {
                // Standard Invite Flow
                await onInvite(email, role);
                showToast.success("Invitación enviada correctamente");
            }
            onClose();
        } catch (error: any) {
            console.error("Error adding member:", error);
            showToast.error(error.message || "Error al agregar miembro");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Agregar Miembro al Equipo</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as OrganizationRole)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="admin">Administrador (Acceso Total)</option>
                            <option value="member">Miembro (Editar Eventos)</option>
                            <option value="viewer">Observador (Solo Ver)</option>
                            <option value="staff">Staff / Operador (Solo Check-in)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {role === 'staff'
                                ? "Crea un usuario para escanear tickets en la entrada."
                                : "Invita a un colaborador a gestionar la organización."}
                        </p>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="usuario@ejemplo.com"
                                required
                            />
                        </div>
                    </div>

                    {/* STAFF SPECIFIC FIELDS */}
                    {role === 'staff' && (
                        <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                            {/* Password Display */}
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                <label className="block text-xs font-semibold text-yellow-800 mb-1">Contraseña Generada</label>
                                <code className="block bg-white px-2 py-1 rounded border border-yellow-200 text-sm font-mono text-gray-800 break-all">
                                    {password}
                                </code>
                                <p className="text-[10px] text-yellow-700 mt-1">Se enviará por email automáticamente.</p>
                            </div>

                            {/* Events */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Asignar Eventos</label>
                                {loadingEvents ? (
                                    <div className="text-sm text-gray-500">Cargando eventos...</div>
                                ) : events.length === 0 ? (
                                    <div className="text-sm text-gray-500 italic">No hay eventos disponibles.</div>
                                ) : (
                                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                                        {events.map(event => (
                                            <label key={event.id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0 border-gray-100">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEvents.includes(event.id!)}
                                                    onChange={() => toggleEvent(event.id!)}
                                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700 truncate">{event.name || event.title}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Permissions */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={canViewDetails}
                                        onChange={(e) => setCanViewDetails(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Ver detalles de asistentes (PII)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={canSell}
                                        onChange={(e) => setCanSell(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Acceso a Punto de Venta (POS)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {role === 'staff' ? 'Crear Staff' : 'Enviar Invitación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
