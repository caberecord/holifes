"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { AppUser } from "../../../types/user";
import { Plus, Trash2, Edit, Shield } from "lucide-react";
import CreateStaffModal from "../../../components/Dashboard/StaffManagement/CreateStaffModal";
import EditStaffModal from "../../../components/Dashboard/StaffManagement/EditStaffModal";

export default function StaffManagementPage() {
    const { appUser, isOrganizer, loading } = useAuth();
    const router = useRouter();
    const [staffList, setStaffList] = useState<AppUser[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<AppUser | null>(null);

    useEffect(() => {
        if (!loading && !isOrganizer) {
            router.push("/dashboard");
        }
    }, [loading, isOrganizer, router]);

    useEffect(() => {
        if (appUser && isOrganizer) {
            loadStaff();
        }
    }, [appUser, isOrganizer]);

    const loadStaff = async () => {
        if (!appUser?.uid) {
            console.error("No appUser available");
            setLoadingStaff(false);
            return;
        }

        try {
            setLoadingStaff(true);
            const q = query(
                collection(db, "users"),
                where("createdBy", "==", appUser.uid),
                where("role", "==", "staff")
            );
            const querySnapshot = await getDocs(q);
            const staff: AppUser[] = [];
            querySnapshot.forEach((doc) => {
                staff.push(doc.data() as AppUser);
            });
            setStaffList(staff);
        } catch (error) {
            console.error("Error loading staff:", error);
            alert("Error al cargar el personal. Verifica que tienes permisos de organizador.");
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleDeleteStaff = async (staffUid: string) => {
        if (!confirm("¿Estás seguro de eliminar este miembro del staff? Esta acción eliminará la cuenta completamente (Authentication + Firestore) y no se puede deshacer.")) return;

        try {
            // Call API to delete from both Firebase Auth and Firestore
            const response = await fetch('/api/users/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: staffUid }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete user');
            }

            // Update local state
            setStaffList(staffList.filter(s => s.uid !== staffUid));
            alert('✅ Usuario eliminado exitosamente de Authentication y Firestore');
        } catch (error: any) {
            console.error("Error deleting staff:", error);
            alert(`❌ Error al eliminar el staff: ${error.message}`);
        }
    };

    if (loading || !appUser) {
        return <div className="p-6">Cargando...</div>;
    }

    if (!isOrganizer) {
        return null;
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Shield className="w-8 h-8 text-indigo-600" />
                            Gestión de Personal
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Crea y administra usuarios staff para el check-in de eventos
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Nuevo Staff</span>
                    </button>
                </div>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loadingStaff ? (
                    <div className="p-12 text-center text-gray-500">
                        Cargando personal...
                    </div>
                ) : staffList.length === 0 ? (
                    <div className="p-12 text-center">
                        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No tienes staff creado
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Crea tu primer usuario staff para comenzar con el check-in
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Staff
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Eventos Asignados
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Permisos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Creación
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {staffList.map((staff) => (
                                    <tr key={staff.uid} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {staff.email.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {staff.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {staff.assignedEvents?.length || 0} eventos
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {staff.permissions?.canViewAttendeeDetails ? (
                                                <span className="text-green-600">✓ Ver detalles</span>
                                            ) : (
                                                <span className="text-gray-400">Solo validar</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(staff.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Resend Email Button */}
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('¿Reenviar invitación por email?')) return;
                                                        try {
                                                            const response = await fetch('/api/resend-staff-email', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ staffUid: staff.uid }),
                                                            });
                                                            if (response.ok) {
                                                                alert('✅ Email reenviado exitosamente');
                                                            } else {
                                                                alert('⚠️ Error al enviar email');
                                                            }
                                                        } catch (error) {
                                                            alert('❌ Error al enviar email');
                                                        }
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                    title="Reenviar invitación"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => setEditingStaff(staff)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteStaff(staff.uid)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Staff Modal */}
            {showCreateModal && (
                <CreateStaffModal
                    organizerId={appUser.uid}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadStaff();
                    }}
                />
            )}

            {/* Edit Staff Modal */}
            {editingStaff && (
                <EditStaffModal
                    staff={editingStaff}
                    organizerId={appUser.uid}
                    onClose={() => setEditingStaff(null)}
                    onSuccess={() => {
                        setEditingStaff(null);
                        loadStaff();
                    }}
                />
            )}
        </div>
    );
}
