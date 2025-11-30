"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createOrganization } from "@/features/organizations/services/organization.service";
import { Loader2, Building2, ArrowRight } from "lucide-react";

export const CreateOrganizationForm = () => {
    const { user, switchOrganization } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        // Auto-generate slug from name
        const newSlug = newName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setSlug(newSlug);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError("");

        try {
            const newOrg = await createOrganization({ name, slug }, user.uid);

            // Switch to the new org immediately
            // Note: We might need to refresh the user's organizations list in context first.
            // For now, we assume the context will update or we force a reload/redirect.

            // In a real app, we'd want to await the context update. 
            // Since our context fetches on mount/auth change, a hard navigation might be safest 
            // or we expose a refresh function in context.
            // For MVP, we'll try to switch and redirect.

            // Force a reload of the dashboard to ensure context picks up the new org
            window.location.href = '/dashboard';

        } catch (err: any) {
            console.error("Error creating organization:", err);
            setError(err.message || "Error al crear la organización. El slug podría estar en uso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                    <Building2 className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Organización</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Organiza tus eventos y colabora con tu equipo en un espacio dedicado.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="orgName" className="text-sm font-medium text-gray-700">
                        Nombre de la Organización
                    </label>
                    <input
                        id="orgName"
                        type="text"
                        required
                        value={name}
                        onChange={handleNameChange}
                        placeholder="Ej. Eventos Globales S.A."
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="orgSlug" className="text-sm font-medium text-gray-700">
                        URL del Portal
                    </label>
                    <div className="flex items-center">
                        <span className="px-3 py-2 text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-sm">
                            holifes.com/
                        </span>
                        <input
                            id="orgSlug"
                            type="text"
                            required
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase())}
                            className="w-full px-4 py-2 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        Esta será la dirección web única para tu organización.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || !name || !slug}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            Crear Organización
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
