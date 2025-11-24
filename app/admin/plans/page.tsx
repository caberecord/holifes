"use client";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, RefreshCw, DollarSign, Ticket, Calendar } from "lucide-react";
import { showToast } from "@/lib/toast";

interface PlanConfig {
    name: string;
    maxTickets: number;
    commissionPercent: number;
    fixedFee: number;
    maxEventsPerMonth: number;
    description: string;
}

interface PlansData {
    freemium: PlanConfig;
    pro: PlanConfig;
    enterprise: PlanConfig;
}

const defaultPlans: PlansData = {
    freemium: {
        name: "Freemium A",
        maxTickets: 100,
        commissionPercent: 0,
        fixedFee: 0,
        maxEventsPerMonth: 1,
        description: "Ideal para eventos pequeños y gratuitos."
    },
    pro: {
        name: "Pro",
        maxTickets: 10000, // "Unlimited" representation
        commissionPercent: 5,
        fixedFee: 0.50,
        maxEventsPerMonth: 10000,
        description: "Para eventos en crecimiento con venta de entradas."
    },
    enterprise: {
        name: "Enterprise",
        maxTickets: 100000,
        commissionPercent: 0, // Custom
        fixedFee: 0, // Custom
        maxEventsPerMonth: 100000,
        description: "Soluciones a medida para grandes organizadores."
    }
};

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<PlansData>(defaultPlans);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const docRef = doc(db, "config", "plans");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPlans(docSnap.data() as PlansData);
            } else {
                // If no config exists, save defaults
                await setDoc(docRef, defaultPlans);
            }
        } catch (error) {
            console.error("Error loading plans:", error);
            showToast.error("Error al cargar la configuración de planes.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, "config", "plans");
            await setDoc(docRef, plans);
            showToast.success("Configuración de planes actualizada correctamente.");
        } catch (error) {
            console.error("Error saving plans:", error);
            showToast.error("Error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (planKey: keyof PlansData, field: keyof PlanConfig, value: any) => {
        setPlans(prev => ({
            ...prev,
            [planKey]: {
                ...prev[planKey],
                [field]: value
            }
        }));
    };

    if (loading) return <div className="text-white p-8">Cargando configuración...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Configuración de Planes</h1>
                    <p className="text-gray-400">Gestiona los límites, comisiones y tarifas de cada plan (Valores en USD).</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-indigo-900/20"
                >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(Object.keys(plans) as Array<keyof PlansData>).map((key) => (
                    <div key={key} className={`rounded-2xl border p-6 backdrop-blur-sm ${key === 'freemium' ? 'bg-gray-800/50 border-gray-700' :
                        key === 'pro' ? 'bg-indigo-900/20 border-indigo-500/30' :
                            'bg-purple-900/20 border-purple-500/30'
                        }`}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white capitalize">{plans[key].name}</h3>
                                <span className="text-xs text-gray-400 uppercase tracking-wider">{key}</span>
                            </div>
                            {key === 'pro' && <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">Popular</span>}
                        </div>

                        <div className="space-y-4">
                            {/* Commission */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Comisión (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={plans[key].commissionPercent}
                                        onChange={(e) => handleChange(key, 'commissionPercent', parseFloat(e.target.value))}
                                        className="w-full bg-black/20 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <span className="absolute right-4 top-2 text-gray-500">%</span>
                                </div>
                            </div>

                            {/* Fixed Fee */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Tarifa Fija (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={plans[key].fixedFee}
                                        onChange={(e) => handleChange(key, 'fixedFee', parseFloat(e.target.value))}
                                        className="w-full bg-black/20 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Max Tickets */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Límite de Tickets</label>
                                <div className="relative">
                                    <Ticket className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                    <input
                                        type="number"
                                        value={plans[key].maxTickets}
                                        onChange={(e) => handleChange(key, 'maxTickets', parseInt(e.target.value))}
                                        className="w-full bg-black/20 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Usa un número alto (ej. 10000) para "Ilimitado"</p>
                            </div>

                            {/* Max Events */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Eventos por Mes</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                    <input
                                        type="number"
                                        value={plans[key].maxEventsPerMonth}
                                        onChange={(e) => handleChange(key, 'maxEventsPerMonth', parseInt(e.target.value))}
                                        className="w-full bg-black/20 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                                <textarea
                                    value={plans[key].description}
                                    onChange={(e) => handleChange(key, 'description', e.target.value)}
                                    className="w-full bg-black/20 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
