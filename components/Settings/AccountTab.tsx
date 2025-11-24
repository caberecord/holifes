"use client";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AlertTriangle, LogOut, Trash2 } from "lucide-react";
import { showToast } from "@/lib/toast";

export default function AccountTab() {
    const { user, logout, deleteAccount } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "ELIMINAR") {
            showToast.error("Por favor, escribe 'ELIMINAR' para confirmar");
            return;
        }

        setIsDeleting(true);
        try {
            await deleteAccount();
            showToast.warning("Cuenta eliminada exitosamente");
        } catch (error: any) {
            console.error("Error deleting account:", error);
            if (error.code === "auth/requires-recent-login") {
                showToast.warning("Por seguridad, debes iniciar sesión nuevamente para eliminar tu cuenta");
            } else {
                showToast.error("Error al eliminar la cuenta: " + (error.message || "Error desconocido"));
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configuración de Cuenta</h2>
                <p className="text-sm text-gray-500 mt-1">Administra tu cuenta y preferencias</p>
            </div>

            {/* Account Info Card */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cuenta</h3>

                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">ID de Usuario</span>
                        <span className="text-sm font-medium text-gray-900 font-mono">{user?.uid?.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Cuenta Creada</span>
                        <span className="text-sm font-medium text-gray-900">
                            {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Último Acceso</span>
                        <span className="text-sm font-medium text-gray-900">
                            {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">Proveedor de Autenticación</span>
                        <span className="text-sm font-medium text-gray-900">
                            {user?.providerData?.[0]?.providerId === "password" ? "Email/Contraseña" : user?.providerData?.[0]?.providerId || "N/A"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Session Management */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Gestión de Sesiones</h3>
                        <p className="text-sm text-gray-500">Controla tus sesiones activas</p>
                    </div>
                </div>

                <button
                    onClick={() => logout()}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                    Cerrar Sesión en Este Dispositivo
                </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-900">Zona Peligrosa</h3>
                        <p className="text-sm text-red-600">Acciones irreversibles</p>
                    </div>
                </div>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Cuenta
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                            <p className="text-sm font-semibold text-red-900 mb-2">
                                ⚠️ ¿Estás completamente seguro?
                            </p>
                            <p className="text-sm text-red-700 mb-3">
                                Esta acción NO se puede deshacer. Se eliminarán permanentemente todos tus eventos, datos y configuraciones.
                            </p>
                            <p className="text-sm text-red-900 font-medium mb-2">
                                Escribe <span className="font-mono bg-red-100 px-1">ELIMINAR</span> para confirmar:
                            </p>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="Escribe ELIMINAR"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || deleteConfirmText !== "ELIMINAR"}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmText("");
                                }}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
