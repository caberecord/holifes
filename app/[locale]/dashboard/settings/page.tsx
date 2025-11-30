"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, Settings, Building2, Plug, Users, ArrowLeft, ChevronRight } from "lucide-react";
import ProfileTab from "@/components/Settings/ProfileTab";
import SecurityTab from "@/components/Settings/SecurityTab";
import AccountTab from "@/components/Settings/AccountTab";
import IntegrationsTab from "@/components/Settings/IntegrationsTab";
import { OrganizationSettings, TeamManagement } from "@/features/organizations/components";
import { useAuth } from "@/context/AuthContext";

type TabType = "profile" | "security" | "account" | "integrations" | "organization" | "team";

export default function SettingsPage() {
    const { appUser, currentOrganization } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("view") as TabType | null;

    const [profileSubTab, setProfileSubTab] = useState<"info" | "security">("info");

    const setActiveTab = (tab: TabType | null) => {
        if (tab) {
            router.push(`/dashboard/settings?view=${tab}`);
        } else {
            router.push(`/dashboard/settings`);
        }
    };

    const allTabs = [
        {
            id: "organization" as TabType,
            label: "Organización",
            description: "Configura la información de tu empresa y adapta Dexter a tu negocio.",
            icon: Building2,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            show: !!currentOrganization
        },
        {
            id: "team" as TabType,
            label: "Equipo",
            description: "Gestiona los miembros de tu organización y sus permisos.",
            icon: Users,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            show: !!currentOrganization
        },
        {
            id: "profile" as TabType,
            label: "Mi Perfil",
            description: "Actualiza tu información personal, foto de perfil y seguridad.",
            icon: User,
            color: "text-green-600",
            bgColor: "bg-green-50",
            show: true
        },
        {
            id: "integrations" as TabType,
            label: "Integraciones",
            description: "Conecta con herramientas externas como Alegra.",
            icon: Plug,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            show: appUser?.accountType === 'business'
        },
        {
            id: "account" as TabType,
            label: "Cuenta",
            description: "Gestiona tu plan de suscripción y facturación.",
            icon: Settings,
            color: "text-gray-600",
            bgColor: "bg-gray-50",
            show: true
        }
    ];

    const visibleTabs = allTabs.filter(tab => tab.show);

    return (
        <div className="bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    {activeTab && (
                        <>
                            <button
                                onClick={() => setActiveTab(null)}
                                className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                                Volver a Configuración
                            </button>
                        </>
                    )}
                </div>

                {/* Content */}
                {activeTab ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {activeTab === "profile" && (
                            <div className="space-y-6">
                                {/* Profile Sub-tabs */}
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setProfileSubTab("info")}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${profileSubTab === "info"
                                            ? "border-indigo-600 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        Información Personal
                                    </button>
                                    <button
                                        onClick={() => setProfileSubTab("security")}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${profileSubTab === "security"
                                            ? "border-indigo-600 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        Seguridad
                                    </button>
                                </div>

                                {profileSubTab === "info" ? <ProfileTab /> : <SecurityTab />}
                            </div>
                        )}
                        {activeTab === "integrations" && <IntegrationsTab />}
                        {activeTab === "account" && <AccountTab />}
                        {activeTab === "organization" && <OrganizationSettings />}
                        {activeTab === "team" && <TeamManagement />}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
                        {visibleTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="flex flex-col text-left bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
                                >
                                    <div className={`w-10 h-10 rounded-lg ${tab.bgColor} ${tab.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                        {tab.label}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-3 flex-1 line-clamp-2">
                                        {tab.description}
                                    </p>
                                    <div className={`flex items-center text-xs font-medium ${tab.color} group-hover:translate-x-1 transition-transform`}>
                                        Configurar
                                        <ChevronRight className="w-3 h-3 ml-1" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
