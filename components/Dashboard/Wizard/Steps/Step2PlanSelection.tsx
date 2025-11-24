"use client";
import { useState, useEffect } from "react";
import { useEventWizardStore, EventPlan } from "@/store/eventWizardStore";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

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

export default function Step2PlanSelection() {
    const { selectedPlan, setPlan, setStep } = useEventWizardStore();
    const { appUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [plansConfig, setPlansConfig] = useState<PlansData | null>(null);
    const [freemiumEventsThisMonth, setFreemiumEventsThisMonth] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            if (!appUser) {
                setLoading(false);
                return;
            }

            try {
                console.log("Fetching plan config...");
                // 1. Load Plan Configuration
                const planDoc = await getDoc(doc(db, "config", "plans"));
                if (planDoc.exists()) {
                    console.log("Plan config found:", planDoc.data());
                    setPlansConfig(planDoc.data() as PlansData);
                } else {
                    console.warn("Plan config not found, using defaults");
                    setPlansConfig({
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
                            maxTickets: 10000,
                            commissionPercent: 5,
                            fixedFee: 0.50,
                            maxEventsPerMonth: 10000,
                            description: "Para eventos en crecimiento con venta de entradas."
                        },
                        enterprise: {
                            name: "Enterprise",
                            maxTickets: 100000,
                            commissionPercent: 0,
                            fixedFee: 0,
                            maxEventsPerMonth: 100000,
                            description: "Soluciones a medida para grandes organizadores."
                        }
                    });
                }

                // 2. Load User's Freemium Event History for this month
                console.log("Fetching user freemium events...");
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                const q = query(
                    collection(db, "events"),
                    where("organizerId", "==", appUser.uid),
                    where("plan", "in", ["freemium", "freemium-a", "freemium-b"]), // Check for any freemium variant
                    where("createdAt", ">=", firstDayOfMonth)
                );

                const snapshot = await getDocs(q);
                console.log("User freemium events fetched:", snapshot.size);
                setFreemiumEventsThisMonth(snapshot.size);

            } catch (error) {
                console.error("Error loading plan data FULL DETAILS:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [appUser]);

    const handleContinue = () => {
        if (selectedPlan) {
            setStep(3);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-500">Cargando planes disponibles...</span>
            </div>
        );
    }

    if (!plansConfig) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Error al cargar planes</h3>
                <p className="text-gray-500">No se pudo cargar la configuración de planes. Por favor intenta más tarde.</p>
            </div>
        );
    }

    // Logic to determine if plans are available
    const canSelectFreemium = freemiumEventsThisMonth < plansConfig.freemium.maxEventsPerMonth;

    const plans = [
        {
            id: "freemium" as EventPlan,
            name: plansConfig.freemium.name,
            price: "Gratis",
            limit: `Max ${plansConfig.freemium.maxTickets} tickets`,
            features: ["Gestión de recaudo propia", "Tickets con QR", "Scanner básico"],
            disabled: !canSelectFreemium,
            reason: `Límite mensual alcanzado (${freemiumEventsThisMonth}/${plansConfig.freemium.maxEventsPerMonth})`,
        },
        {
            id: "pro" as EventPlan,
            name: plansConfig.pro.name,
            price: `${plansConfig.pro.commissionPercent}% + $${plansConfig.pro.fixedFee}`,
            limit: "Tickets Ilimitados",
            features: ["Pasarela de pagos", "Soporte prioritario", "Analytics avanzados"],
            disabled: false,
            popular: true,
        },
        {
            id: "enterprise" as EventPlan,
            name: plansConfig.enterprise.name,
            price: "A medida",
            limit: "Tickets Ilimitados",
            features: ["Marca blanca", "Alquiler de plataforma", "Account Manager"],
            disabled: false,
        },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona tu Plan</h2>
            <p className="text-gray-500 mb-8">Elige el modelo que mejor se adapte a tu evento.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => !plan.disabled && setPlan(plan.id)}
                        className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 ${plan.disabled
                            ? "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"
                            : selectedPlan === plan.id
                                ? "border-indigo-600 bg-indigo-50 shadow-md"
                                : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                RECOMENDADO
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                                <p className="text-indigo-600 font-semibold">{plan.price}</p>
                            </div>
                            {selectedPlan === plan.id && (
                                <div className="h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                {plan.limit}
                            </span>
                        </div>

                        <ul className="space-y-2 mb-4">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500 mr-2" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {plan.disabled && (
                            <div className="mt-4 flex items-center text-amber-600 text-sm bg-amber-50 p-2 rounded">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {plan.reason}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                    onClick={() => setStep(1)}
                    className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                    Atrás
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!selectedPlan}
                    className={`px-6 py-2 rounded-lg transition-colors font-medium ${selectedPlan
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}
