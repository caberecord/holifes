"use client";

import { useState } from "react";
import { X, Mail, Shield, Loader2 } from "lucide-react";
import { OrganizationRole } from "@/features/organizations/types/member.schema";

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, role: OrganizationRole) => Promise<void>;
}

export const InviteMemberModal = ({ isOpen, onClose, onInvite }: InviteMemberModalProps) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<OrganizationRole>("member");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await onInvite(email, role);
            onClose();
            setEmail("");
            setRole("member");
        } catch (err: any) {
            setError(err.message || "Error al enviar invitación");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Invitar Miembro</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="colaborador@ejemplo.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Rol</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as OrganizationRole)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                            >
                                <option value="admin">Administrador</option>
                                <option value="member">Miembro</option>
                                <option value="viewer">Observador</option>
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {role === 'admin' && "Acceso total a la configuración y eventos."}
                            {role === 'member' && "Puede crear y gestionar eventos."}
                            {role === 'viewer' && "Solo lectura."}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Enviando..." : "Enviar Invitación"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
