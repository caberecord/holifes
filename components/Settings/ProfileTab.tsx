"use client";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User } from "lucide-react";
import { showToast } from "@/lib/toast";

export default function ProfileTab() {
    const { user, appUser, updateUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || user?.email?.split('@')[0] || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateUserProfile(displayName);
            setIsEditing(false);
            showToast.success("Perfil actualizado exitosamente");
        } catch (error) {
            console.error("Error updating profile:", error);
            showToast.error("Error al actualizar el perfil");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Información del Perfil</h2>
                <p className="text-sm text-gray-500 mt-1">Administra tu información personal</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-sm">
                {/* Avatar Section */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {displayName || "Usuario"}
                        </h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <div className="mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {appUser?.role === "organizer" ? "Organizador" : "Staff"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de Usuario
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-4 py-2 border rounded-lg transition-all ${isEditing
                                ? "border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                : "border-gray-200 bg-gray-50 cursor-not-allowed"
                                }`}
                            placeholder="Ingresa tu nombre"
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            El correo electrónico no puede ser modificado
                        </p>
                    </div>

                    {/* Role (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rol
                        </label>
                        <input
                            type="text"
                            value={appUser?.role === "organizer" ? "Organizador Pro" : "Personal"}
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500"
                        />
                    </div>

                    {/* Account Type */}
                    {appUser?.role === "organizer" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Cuenta
                            </label>
                            <select
                                value={appUser?.accountType || "personal"}
                                onChange={async (e) => {
                                    const newType = e.target.value as 'personal' | 'business';

                                    if (newType === 'personal' && appUser?.accountType === 'business') {
                                        if (!confirm("⚠️ Al cambiar a cuenta Personal, se ocultará la pestaña de Empresa. ¿Continuar?")) {
                                            return;
                                        }
                                    }

                                    try {
                                        const { doc, updateDoc } = await import('firebase/firestore');
                                        const { db } = await import('../../lib/firebase');
                                        await updateDoc(doc(db, "users", user!.uid), {
                                            accountType: newType,
                                        });
                                        window.location.reload(); // Reload to update UI
                                    } catch (error) {
                                        console.error("Error updating account type:", error);
                                        showToast.error("Error al actualizar el tipo de cuenta");
                                    }
                                }}
                                disabled={!isEditing}
                                className={`w-full px-4 py-2 border rounded-lg transition-all ${isEditing
                                    ? "border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    : "border-gray-200 bg-gray-50 cursor-not-allowed"
                                    }`}
                            >
                                <option value="personal">Personal</option>
                                <option value="business">Empresa</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {appUser?.accountType === 'business' ? "Puedes gestionar datos fiscales en la pestaña Empresa" : "Cambia a Empresa para acceder a la gestión de datos fiscales"}
                            </p>
                        </div>
                    )}

                    {/* Account Created */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cuenta Creada
                        </label>
                        <input
                            type="text"
                            value={user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('es-ES') : "N/A"}
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Editar Perfil
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setDisplayName(user?.displayName || user?.email?.split('@')[0] || "");
                                }}
                                disabled={isSaving}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
