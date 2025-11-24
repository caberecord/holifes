"use client";
import { useEventWizardStore, DistributionMethod } from "@/store/eventWizardStore";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Upload, CreditCard, Ticket, Mail, CheckCircle, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/lib/toast";

export default function Step4Distribution() {
    const {
        basicInfo,
        selectedPlan,
        venue,
        distribution,
        setDistributionMethod,
        setUploadedGuests,
        resetWizard,
        setStep
    } = useEventWizardStore();

    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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

    const handleFinish = async () => {
        if (!user) {
            showToast.error("Debes estar autenticado para crear un evento.");
            return;
        }

        try {
            setIsSaving(true);

            const eventData = {
                ...basicInfo,
                plan: selectedPlan,
                venue: {
                    type: venue.type,
                    zones: venue.zones,
                    totalCapacity: venue.totalCapacity
                },
                distribution: {
                    method: distribution.method,
                    hasGuestList: distribution.uploadedGuests.length > 0,
                    guestCount: distribution.uploadedGuests.length
                },
                organizerId: user.uid,
                organizerEmail: user.email,
                createdAt: serverTimestamp(),
                status: 'draft' // Default status
            };

            // Save to Firestore
            const docRef = await addDoc(collection(db, "events"), eventData);
            console.log("Event created with ID: ", docRef.id);

            // Send confirmation email
            try {
                await fetch('/api/send-event-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        userName: user.displayName || user.email?.split('@')[0],
                        event: { ...eventData, id: docRef.id }
                    }),
                });
            } catch (emailError) {
                console.error("Error sending confirmation email:", emailError);
                // Don't block the success flow if email fails
            }

            // Optional: Save guest list to a subcollection if it's large, 
            // but for MVP we'll keep it simple or assume it's handled separately.
            // For now, we are NOT saving the full guest list to the event doc to avoid size limits.

            showToast.success("¡Evento creado exitosamente! Se ha enviado un correo de confirmación.");
            resetWizard();
            router.push("/dashboard");
        } catch (error) {
            console.error("Error adding document: ", error);
            showToast.error("Hubo un error al guardar el evento. Inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Distribución y Venta</h2>
            <p className="text-gray-500 mb-8">Define cómo llegarán los boletos a tus asistentes.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    {
                        id: "manual" as DistributionMethod,
                        title: "Venta Manual",
                        icon: <Ticket className="w-8 h-8 text-indigo-600" />,
                        desc: "Tú gestionas el pago y entregas el ticket.",
                    },
                    {
                        id: "stripe" as DistributionMethod,
                        title: "Pasarela de Pago",
                        icon: <CreditCard className="w-8 h-8 text-purple-600" />,
                        desc: "Venta automática con Stripe (Comisión 5%).",
                    },
                    {
                        id: "invite" as DistributionMethod,
                        title: "Invitacional",
                        icon: <Mail className="w-8 h-8 text-emerald-600" />,
                        desc: "Envía tickets por email a una lista.",
                    },
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => setDistributionMethod(option.id)}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${distribution.method === option.id
                            ? "border-indigo-600 bg-indigo-50 shadow-md"
                            : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
                            }`}
                    >
                        <div className="mb-4 bg-white w-14 h-14 rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                            {option.icon}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{option.title}</h3>
                        <p className="text-sm text-gray-500">{option.desc}</p>
                    </button>
                ))}
            </div>

            {distribution.method === "invite" && (
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
                    onClick={() => setStep(3)}
                    className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                    Atrás
                </button>
                <button
                    onClick={handleFinish}
                    disabled={isSaving || !distribution.method || (distribution.method === "invite" && distribution.uploadedGuests.length === 0)}
                    className={`px-8 py-3 rounded-lg transition-colors font-bold shadow-lg flex items-center ${distribution.method && (distribution.method !== "invite" || distribution.uploadedGuests.length > 0)
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:-translate-y-0.5"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        }`}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        "Crear Evento"
                    )}
                </button>
            </div>
        </div>
    );
}
