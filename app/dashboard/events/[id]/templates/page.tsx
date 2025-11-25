'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SiteTemplate } from '../../../../../types/template';
import { toast } from 'react-toastify';
import { Layout, Check, AlertTriangle } from 'lucide-react';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<SiteTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    useEffect(() => {
        fetch('/api/templates')
            .then(res => res.json())
            .then(data => {
                setTemplates(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Error al cargar plantillas');
                setLoading(false);
            });
    }, []);

    const handleApplyTemplate = async (templateId: string) => {
        if (!confirm('¿Estás seguro? Esto reemplazará todo el diseño actual de tu sitio.')) {
            return;
        }

        setApplying(templateId);
        try {
            const res = await fetch(`/api/events/${eventId}/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId })
            });

            if (!res.ok) throw new Error('Error applying template');

            toast.success('¡Plantilla aplicada correctamente!');
            router.push(`/dashboard/events/${eventId}/builder-v2`);
        } catch (error) {
            console.error(error);
            toast.error('Error al aplicar la plantilla');
        } finally {
            setApplying(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Galería de Plantillas</h1>
                        <p className="mt-2 text-gray-600">Elige un diseño profesional para comenzar tu sitio.</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                        ← Volver
                    </button>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Advertencia:</strong> Al aplicar una plantilla, se sobrescribirá cualquier diseño existente en tu sitio.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="relative h-48 bg-gray-200">
                                <img
                                    src={template.thumbnailUrl}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wide text-gray-800">
                                    {template.category}
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{template.description}</p>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={() => handleApplyTemplate(template.id)}
                                    disabled={applying === template.id}
                                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {applying === template.id ? (
                                        'Aplicando...'
                                    ) : (
                                        <>
                                            <Layout className="w-4 h-4 mr-2" />
                                            Usar Plantilla
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
