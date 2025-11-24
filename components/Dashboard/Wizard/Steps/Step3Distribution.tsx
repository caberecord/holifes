"use client";
import { useEventWizardStore, DistributionMethod } from "@/store/eventWizardStore";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Upload, CreditCard, Ticket, Mail, Gift, CheckCircle, Loader2, Lock, Check } from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/lib/toast";

export default function Step3Distribution() {
    const {
        selectedPlan,
        distribution,
        toggleDistributionMethod,
        setUploadedGuests,
        setStep
    } = useEventWizardStore();

    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setIsUploading(true);

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    setUploadedGuests(jsonData);
                } catch (error) {
                    console.error("Error parsing Excel file:", error);
                    showToast.error("Error al leer el archivo Excel. Asegúrate de que sea válido.");
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsBinaryString(file);
        }
    }, [setUploadedGuests]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
            "text/csv": [".csv"],
        },
        maxFiles: 1,
    });

    // Define availability based on plan
    // For Freemium plans only 'invite' and 'free' methods are allowed
    const planConfig = {
        'freemium-a': ['invite', 'free'],
        'freemium-b': ['invite', 'free'],
        'pro': ['manual', 'stripe'],
        'enterprise': ['manual', 'stripe', 'invite', 'free']
    };

    const availableMethods = selectedPlan ? planConfig[selectedPlan as keyof typeof planConfig] || [] : [];

    const isMethodAvailable = (method: DistributionMethod) => {
        return availableMethods.includes(method);
    };

    const getUnavailableMessage = (method: DistributionMethod) => {
        if (selectedPlan === 'freemium-a' || selectedPlan === 'freemium-b') {
            if (method === 'manual' || method === 'stripe') {
                return 'Disponible en planes Pro y Enterprise';
            }
        } else if (selectedPlan === 'pro') {
            if (method === 'invite' || method === 'free') {
                return 'Disponible en planes Freemium y Enterprise';
            }
        }
        return '';
    };

    const distributionOptions = [
        {
            id: "manual" as DistributionMethod,
            title: "Venta Manual",
            icon: <Ticket className="w-8 h-8" />,
            iconColor: "text-indigo-600",
            desc: "Tú gestionas el pago y entregas el ticket.",
        },
        {
            id: "stripe" as DistributionMethod,
            title: "Pasarela de Pago",
            icon: <CreditCard className="w-8 h-8" />,
            iconColor: "text-purple-600",
            desc: "Venta automática con Stripe (Comisión 5%).",
        },
        {
            id: "invite" as DistributionMethod,
            title: "Invitacional",
            icon: <Mail className="w-8 h-8" />,
            iconColor: "text-emerald-600",
            desc: "Envía tickets por email a una lista.",
        },
        {
            id: "free" as DistributionMethod,
            title: "Boletería Gratis",
            icon: <Gift className="w-8 h-8" />,
            iconColor: "text-amber-600",
            desc: "Evento sin costo, acceso libre con registro.",
        },
    ];

    const hasInviteSelected = distribution.methods.includes("invite");
    const hasAtLeastOneMethod = distribution.methods.length > 0;
    const needsGuestList = hasInviteSelected && distribution.uploadedGuests.length === 0;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-bold text-gray-900">Distribución y Venta</h2>
                <p className="text-gray-500 mt-1">Selecciona los métodos de distribución que usarás (puedes elegir varios).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {distributionOptions.map((option) => {
                    const available = isMethodAvailable(option.id);
                    const isSelected = distribution.methods.includes(option.id);
                    const unavailableMsg = getUnavailableMessage(option.id);

                    return (
                        <div key={option.id} className="relative group">
                            <button
                                onClick={() => available && toggleDistributionMethod(option.id)}
                                disabled={!available}
                                className={`w-full p-6 rounded-xl border-2 text-left transition-all relative ${isSelected && available
                                    ? "border-indigo-600 bg-indigo-50 shadow-md"
                                    : available
                                        ? "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
                                        : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                    }`}
                                title={!available ? unavailableMsg : ""}
                            >
                                {!available && (
                                    <div className="absolute top-3 right-3">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                )}

                                {isSelected && available && (
                                    <div className="absolute top-3 right-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                )}

                                <div className="mb-4 bg-white w-14 h-14 rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                                    <div className={available ? option.iconColor : "text-gray-400"}>
                                        {option.icon}
                                    </div>
                                </div>
                                <h3 className={`font-bold mb-1 ${available ? "text-gray-900" : "text-gray-500"}`}>
                                    {option.title}
                                </h3>
                                <p className={`text-sm ${available ? "text-gray-500" : "text-gray-400"}`}>
                                    {option.desc}
                                </p>

                                {!available && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs text-amber-600 font-medium">{unavailableMsg}</p>
                                    </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {hasInviteSelected && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-gray-900 mb-4">Cargar Lista de Invitados</h3>

                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-indigo-600 bg-indigo-50" : "border-gray-300 hover:border-indigo-400"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                        {isUploading ? (
                            <p className="text-gray-600">Procesando archivo...</p>
                        ) : (
                            <>
                                <p className="text-gray-700 font-medium mb-1">
                                    Arrastra tu archivo Excel aquí o haz clic para seleccionar
                                </p>
                                <p className="text-sm text-gray-500">
                                    Formatos soportados: .xlsx, .xls, .csv
                                </p>
                            </>
                        )}
                    </div>

                    {distribution.uploadedGuests.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center text-emerald-600 mb-3">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span className="font-medium">
                                    {distribution.uploadedGuests.length} invitados cargados correctamente
                                </span>
                            </div>

                            <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {Object.keys(distribution.uploadedGuests[0] || {}).map((header) => (
                                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {distribution.uploadedGuests.slice(0, 5).map((row, i) => (
                                            <tr key={i}>
                                                {Object.values(row).map((val: any, j) => (
                                                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {val}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {distribution.uploadedGuests.length > 5 && (
                                    <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500 text-center border-t">
                                        Mostrando 5 de {distribution.uploadedGuests.length} registros
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                    onClick={() => setStep(2)}
                    className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                    Atrás
                </button>
                <button
                    onClick={() => setStep(4)}
                    disabled={!hasAtLeastOneMethod || needsGuestList}
                    className={`px-8 py-3.5 rounded-xl transition-all font-semibold shadow-lg flex items-center gap-2 ${hasAtLeastOneMethod && !needsGuestList
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        }`}
                >
                    Continuar al Diseño
                </button>
            </div>
        </div>
    );
}
