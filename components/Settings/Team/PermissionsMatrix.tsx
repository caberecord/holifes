"use client";

import { useState } from "react";
import { Check, Shield, Info } from "lucide-react";
import { DEFAULT_ROLES, PermissionAction, RoleDefinition } from "@/types/permissions";

interface PermissionsMatrixProps {
    roles?: RoleDefinition[];
}

export default function PermissionsMatrix({ roles = DEFAULT_ROLES }: PermissionsMatrixProps) {
    const [activeRoles, setActiveRoles] = useState<RoleDefinition[]>(roles);

    const permissionCategories: { label: string; permissions: { id: PermissionAction; label: string }[] }[] = [
        {
            label: "Eventos",
            permissions: [
                { id: "event.create", label: "Crear Eventos" },
                { id: "event.edit", label: "Editar Eventos" },
                { id: "event.delete", label: "Eliminar Eventos" },
                { id: "event.view_audit", label: "Ver Auditoría" },
            ]
        },
        {
            label: "Equipo",
            permissions: [
                { id: "team.manage", label: "Gestionar Miembros" },
            ]
        },
        {
            label: "Finanzas",
            permissions: [
                { id: "finance.view", label: "Ver Finanzas" },
            ]
        },
        {
            label: "Configuración",
            permissions: [
                { id: "settings.manage", label: "Gestionar Configuración" },
            ]
        }
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-indigo-600" />
                    Matriz de Permisos
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Visualiza qué acciones puede realizar cada rol en la plataforma.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 min-w-[200px]">Permiso</th>
                            {activeRoles.map(role => (
                                <th key={role.id} className="px-6 py-4 text-center min-w-[120px]">
                                    <div className="flex flex-col items-center">
                                        <span>{role.name}</span>
                                        <span className="text-xs font-normal text-gray-500 mt-1 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                            {role.id}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {permissionCategories.map((category) => (
                            <>
                                <tr key={category.label} className="bg-gray-50/50">
                                    <td colSpan={activeRoles.length + 1} className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {category.label}
                                    </td>
                                </tr>
                                {category.permissions.map((perm) => (
                                    <tr key={perm.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {perm.label}
                                        </td>
                                        {activeRoles.map(role => {
                                            const hasPermission = role.permissions.includes(perm.id);
                                            return (
                                                <td key={`${role.id}-${perm.id}`} className="px-6 py-4 text-center">
                                                    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${hasPermission ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                                                        {hasPermission && <Check className="w-4 h-4" />}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>
                    Los roles predeterminados (Propietario, Admin, Editor, Visualizador) tienen permisos fijos por seguridad.
                    Próximamente podrás crear roles personalizados.
                </p>
            </div>
        </div>
    );
}
