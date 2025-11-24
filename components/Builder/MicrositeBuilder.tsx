"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/lib/toast';
import { Event } from "@/types/event";
import { generateSiteAction } from "@/app/actions/generate-site";
import { GeneratedTheme } from "@/lib/ai/gemini";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Wand2, Save, Layout, Type, Palette } from "lucide-react";

interface MicrositeBuilderProps {
    event: Event;
}

export default function MicrositeBuilder({ event }: MicrositeBuilderProps) {
    const [theme, setTheme] = useState<GeneratedTheme | null>(event.microsite?.theme || null);
    const [subdomain, setSubdomain] = useState(event.microsite?.subdomain || event.name.toLowerCase().replace(/[^a-z0-9]/g, "-"));
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"design" | "content">("design");
    const [error, setError] = useState<string | null>(null);
    const [customInstructions, setCustomInstructions] = useState("");

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            // Prepare event details
            const eventDetails = {
                date: event.date ? new Date(event.date).toLocaleDateString() : undefined,
                location: event.location,
                // Calculate price range if available
                priceRange: event.venue?.zones
                    ? `$${Math.min(...event.venue.zones.map(z => z.price))} - $${Math.max(...event.venue.zones.map(z => z.price))}`
                    : undefined
            };

            const result = await generateSiteAction(
                event.description,
                event.name,
                customInstructions,
                eventDetails
            );

            if (result) {
                if (result.error) {
                    setError(result.error);
                } else {
                    setTheme(result);
                }
            } else {
                setError("Error desconocido al generar el sitio");
            }
        } catch (err) {
            console.error("Error generating theme:", err);
            setError("Ocurrió un error inesperado al comunicarse con la IA.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!theme) return;
        setIsSaving(true);
        try {
            const eventRef = doc(db, "events", event.id!);
            await updateDoc(eventRef, {
                microsite: {
                    enabled: true,
                    subdomain: subdomain,
                    theme: theme,
                    publishedAt: new Date().toISOString()
                }
            });
            showToast.success("¡Sitio guardado y publicado!");
        } catch (error) {
            console.error("Error saving site:", error);
            showToast.error("Error guardando los cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100 overflow-hidden font-sans">
            {/* Sidebar Controls */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-lg">
                <div className="p-5 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-indigo-600" />
                        Constructor de Sitios
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Diseña la página de tu evento</p>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <h4 className="text-xs font-bold text-red-800 mb-1">Error de IA</h4>
                            <p className="text-xs text-red-600 break-words">{error}</p>
                            {error.includes("console.developers.google.com") && (
                                <a
                                    href="https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-red-800 underline mt-2 block"
                                >
                                    Habilitar API aquí &rarr;
                                </a>
                            )}
                        </div>
                    )}

                    {/* AI Generator */}
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                            <Wand2 className="w-4 h-4" />
                            Generador IA
                        </h3>
                        <p className="text-xs text-indigo-700 mb-4">
                            Crea un diseño único basado en la descripción de tu evento.
                        </p>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-indigo-900 mb-1">
                                Instrucciones Personalizadas (Opcional)
                            </label>
                            <textarea
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder="Ej: 'Estilo minimalista', 'Colores neón', 'Tono divertido'..."
                                className="w-full text-xs border-indigo-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white/50"
                                rows={2}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4" />
                                    Generar Sitio Mágico
                                </>
                            )}
                        </button>
                    </div>

                    {theme && (
                        <>
                            {/* Subdomain Config */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Subdominio</label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={subdomain}
                                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        .holifes.com
                                    </span>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab("design")}
                                    className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === "design" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                >
                                    Diseño
                                </button>
                                <button
                                    onClick={() => setActiveTab("content")}
                                    className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === "content" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                >
                                    Contenido
                                </button>
                            </div>

                            {activeTab === "design" ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Palette className="w-4 h-4" />
                                            Colores
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-xs text-gray-500 block mb-1">Primario</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={theme.colorPalette.primary}
                                                        onChange={(e) => setTheme({ ...theme, colorPalette: { ...theme.colorPalette, primary: e.target.value } })}
                                                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                                    />
                                                    <span className="text-xs font-mono text-gray-600">{theme.colorPalette.primary}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 block mb-1">Fondo</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={theme.colorPalette.background}
                                                        onChange={(e) => setTheme({ ...theme, colorPalette: { ...theme.colorPalette, background: e.target.value } })}
                                                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                                    />
                                                    <span className="text-xs font-mono text-gray-600">{theme.colorPalette.background}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Type className="w-4 h-4" />
                                            Tipografía
                                        </label>
                                        <input
                                            type="text"
                                            value={theme.typography.headingFont}
                                            onChange={(e) => setTheme({ ...theme, typography: { ...theme.typography, headingFont: e.target.value } })}
                                            className="w-full text-sm border-gray-300 rounded-md mb-2"
                                            placeholder="Fuente de Títulos"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {theme.content && (
                                        <>
                                            {/* Hero Section Edit */}
                                            <div className="border-b pb-4">
                                                <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Hero</h4>
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Título</label>
                                                        <input
                                                            type="text"
                                                            value={theme.content.hero.title}
                                                            onChange={(e) => setTheme({ ...theme, content: { ...theme.content, hero: { ...theme.content.hero, title: e.target.value } } })}
                                                            className="w-full text-sm border-gray-300 rounded-md"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Subtítulo</label>
                                                        <textarea
                                                            value={theme.content.hero.subtitle}
                                                            onChange={(e) => setTheme({ ...theme, content: { ...theme.content, hero: { ...theme.content.hero, subtitle: e.target.value } } })}
                                                            className="w-full text-sm border-gray-300 rounded-md"
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Save Button */}
                {theme && (
                    <div className="p-5 border-t border-gray-200">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Guardar y Publicar
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-auto bg-gray-50">
                <div className="p-8">
                    {!theme ? (
                        <div className="text-center py-32">
                            <Wand2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Genera tu sitio con IA</h3>
                            <p className="text-gray-500">Haz clic en "Generar Sitio Mágico" para empezar</p>
                        </div>
                    ) : (
                        <div
                            className="bg-white rounded-xl shadow-2xl overflow-hidden"
                            style={{ fontFamily: theme.typography.bodyFont }}
                        >
                            {/* Hero Preview */}
                            <div
                                className="p-12 text-center"
                                style={{
                                    background: `linear-gradient(135deg, ${theme.colorPalette.primary}, ${theme.colorPalette.secondary})`,
                                    color: theme.colorPalette.text
                                }}
                            >
                                <h1
                                    className="text-4xl font-bold mb-4"
                                    style={{ fontFamily: theme.typography.headingFont }}
                                >
                                    {theme.content.hero.title}
                                </h1>
                                <p className="text-lg opacity-90">{theme.content.hero.subtitle}</p>
                            </div>

                            <div className="p-8">
                                <p className="text-gray-600 text-center">Vista previa del sitio...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
