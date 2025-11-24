"use client";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Lock, Eye, EyeOff } from "lucide-react";
import { showToast } from "@/lib/toast";

export default function SecurityTab() {
    const { user, changePassword } = useAuth();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChanging, setIsChanging] = useState(false);

    const passwordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: "", color: "" };
        if (password.length < 6) return { strength: 1, label: "Muy débil", color: "bg-red-500" };
        if (password.length < 8) return { strength: 2, label: "Débil", color: "bg-orange-500" };
        if (password.length < 12) return { strength: 3, label: "Buena", color: "bg-yellow-500" };
        return { strength: 4, label: "Fuerte", color: "bg-green-500" };
    };

    const strength = passwordStrength(newPassword);

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            showToast.error("Las contraseñas no coinciden");
            return;
        }

        if (newPassword.length < 6) {
            showToast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsChanging(true);
        try {
            await changePassword(newPassword);
            showToast.success("Contraseña actualizada exitosamente");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Error changing password:", error);
            if (error.code === "auth/requires-recent-login") {
                showToast.warning("Por seguridad, debes iniciar sesión nuevamente para cambiar tu contraseña");
            } else {
                showToast.error("Error al cambiar la contraseña: " + (error.message || "Error desconocido"));
            }
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Seguridad</h2>
                <p className="text-sm text-gray-500 mt-1">Gestiona tu contraseña y opciones de seguridad</p>
            </div>

            {/* Change Password Card */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h3>
                        <p className="text-sm text-gray-500">Actualiza tu contraseña regularmente para mayor seguridad</p>
                    </div>
                </div>

                <div className="space-y-4 mt-6">
                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Ingresa tu nueva contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {newPassword.length > 0 && (
                            <div className="mt-2">
                                <div className="flex gap-1 mb-1">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full ${level <= strength.strength ? strength.color : "bg-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Fortaleza: <span className="font-medium">{strength.label}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Confirma tu nueva contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Password Match Indicator */}
                        {confirmPassword.length > 0 && (
                            <p className={`text-xs mt-1 ${newPassword === confirmPassword ? "text-green-600" : "text-red-600"}`}>
                                {newPassword === confirmPassword ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                            </p>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Recomendaciones:</strong>
                        </p>
                        <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                            <li>Usa al menos 8 caracteres</li>
                            <li>Combina letras mayúsculas y minúsculas</li>
                            <li>Incluye números y símbolos</li>
                            <li>Evita información personal obvia</li>
                        </ul>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleChangePassword}
                        disabled={isChanging || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isChanging ? "Cambiando..." : "Cambiar Contraseña"}
                    </button>
                </div>
            </div>

            {/* Last Password Change */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                    <strong>Última modificación:</strong> {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('es-ES') : "N/A"}
                </p>
            </div>
        </div>
    );
}
