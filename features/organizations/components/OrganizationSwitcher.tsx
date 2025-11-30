"use client";

import { useAuth } from "@/context/AuthContext";
import { ChevronDown, Plus, Building2, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export const OrganizationSwitcher = () => {
    const { organizations, currentOrganization, switchOrganization } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!currentOrganization) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
                <Building2 className="w-4 h-4" />
                <span>Sin Organización</span>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 transition-colors rounded-lg hover:bg-gray-100 group border border-transparent hover:border-gray-200"
            >
                <div className="flex items-center gap-2 truncate">
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-indigo-50 text-indigo-600">
                        {currentOrganization.settings?.logoUrl ? (
                            <img
                                src={currentOrganization.settings.logoUrl}
                                alt={currentOrganization.name}
                                className="w-full h-full object-cover rounded"
                            />
                        ) : (
                            <Building2 className="w-4 h-4" />
                        )}
                    </div>
                    <span className="truncate max-w-[140px]">{currentOrganization.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 z-50 w-full mt-1 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">
                            Organizaciones
                        </div>

                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => {
                                    switchOrganization(org.id);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-2 py-2 text-sm rounded-md group ${currentOrganization.id === org.id
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span className="truncate">{org.name}</span>
                                </div>
                                {currentOrganization.id === org.id && (
                                    <Check className="w-4 h-4" />
                                )}
                            </button>
                        ))}

                        <div className="h-px my-1 bg-gray-100" />

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push('/dashboard/organizations/new');
                            }}
                            className="flex items-center w-full px-2 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Organización
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
