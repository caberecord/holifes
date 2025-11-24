"use client";
import { useState } from "react";
import { User, Lock, Settings, Building2 } from "lucide-react";
import ProfileTab from "../../../components/Settings/ProfileTab";
import SecurityTab from "../../../components/Settings/SecurityTab";
import AccountTab from "../../../components/Settings/AccountTab";
import CompanyTab from "../../../components/Settings/CompanyTab";
import { useAuth } from "../../../context/AuthContext";
import { showToast } from "@/lib/toast";

type TabType = "profile" | "security" | "account" | "company" | "developer";

export default function SettingsPage() {
    const { appUser } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("profile");

    const baseTabs = [
        { id: "profile" as TabType, label: "Perfil", icon: User },
        { id: "security" as TabType, label: "Seguridad", icon: Lock },
        { id: "account" as TabType, label: "Cuenta", icon: Settings },
        { id: "developer" as TabType, label: "Developer", icon: Lock }, // Hidden tab for dev tools
    ];

    // Add Company tab only if account is business type
    const tabs = appUser?.accountType === 'business'
        ? [...baseTabs.slice(0, 1), { id: "company" as TabType, label: "Empresa", icon: Building2 }, ...baseTabs.slice(1)]
        : baseTabs;

    const handleCleanup = async () => {
        if (!confirm("⚠️ ¿ESTÁS SEGURO? \n\nEsto eliminará TODOS los eventos y usuarios staff de la base de datos. \n\nEsta acción es irreversible y se usa para limpiar datos incompatibles con las nuevas reglas de seguridad.")) return;

        try {
            const res = await fetch('/api/debug/cleanup', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                showToast.success(data.message);
                window.location.reload();
            } else {
                showToast.error("Error: " + data.error);
            }
        } catch (error) {
            showToast.error("Error de conexión");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Configuración
                    </h1>
                    <p className="text-gray-600">
                        Administra tu perfil, seguridad y preferencias de cuenta
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl p-2 mb-6 shadow-sm">
                    <div className="flex gap-2 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                        : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {activeTab === "profile" && <ProfileTab />}
                    {activeTab === "company" && <CompanyTab />}
                    {activeTab === "security" && <SecurityTab />}
                    {activeTab === "account" && <AccountTab />}
                    {activeTab === "developer" && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                                <h3 className="text-lg font-bold text-red-600 mb-4">Zona de Peligro (Developer)</h3>
                                <p className="text-gray-600 mb-6">
                                    Herramientas para limpiar la base de datos durante el desarrollo. Úsalo con precaución.
                                </p>
                                <button
                                    onClick={handleCleanup}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold shadow-md"
                                >
                                    💣 Limpiar Base de Datos (Eventos y Staff)
                                </button>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm">
                                <h3 className="text-lg font-bold text-indigo-600 mb-4">Super Admin Tool 🦸‍♂️</h3>
                                <p className="text-gray-600 mb-4">
                                    Convierte un usuario en Super Admin (God Mode).
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        id="superAdminEmail"
                                        placeholder="email@ejemplo.com"
                                        defaultValue="caberecord@gmail.com"
                                        className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <button
                                        onClick={async () => {
                                            const email = (document.getElementById('superAdminEmail') as HTMLInputElement).value;
                                            if (!email) return showToast.error("Ingresa un email");

                                            try {
                                                const res = await fetch('/api/debug/make-superadmin', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ email })
                                                });
                                                const data = await res.json();
                                                if (res.ok) {
                                                    showToast.success(data.message);
                                                    window.location.reload(); // Reload to update claims/UI
                                                } else {
                                                    showToast.error("Error: " + data.error);
                                                }
                                            } catch (e) {
                                                showToast.error("Error de conexión");
                                            }
                                        }}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-bold shadow-md"
                                    >
                                        Promover
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
