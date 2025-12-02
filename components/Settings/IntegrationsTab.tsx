
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Plug, CheckCircle2, XCircle, Loader2, Save, ExternalLink, ChevronRight } from "lucide-react";
import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { showToast } from "@/lib/toast";
import { CompanyData, AlegraConfig } from "../../types/company";

export default function IntegrationsTab() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [alegraExpanded, setAlegraExpanded] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const [alegraConfig, setAlegraConfig] = useState<Partial<AlegraConfig>>({
        isConnected: false,
        email: "",
        token: "",
        isSandbox: true,
    });

    const [nequiConfig, setNequiConfig] = useState({
        clientId: "",
        clientSecret: "",
        apiKey: "",
        authUrl: "https://oauth.nequi.com/oauth2/v4/token",
        apiUrl: "https://api.nequi.com",
        isConnected: false
    });
    const [nequiExpanded, setNequiExpanded] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        if (!user) return;
        try {
            const companyDoc = await getDoc(doc(db, "users", user.uid, "companyData", "info"));
            if (companyDoc.exists()) {
                const data = companyDoc.data() as CompanyData;
                if (data.alegra) {
                    setAlegraConfig(data.alegra);
                } else {
                    // Pre-fill email if available
                    setAlegraConfig(prev => ({ ...prev, email: user.email || "" }));
                }
                if (data.nequi) {
                    setNequiConfig(prev => ({ ...prev, ...data.nequi }));
                }
            }
        } catch (error) {
            console.error("Error loading integrations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadLogs = async () => {
        if (!user) return;
        setLoadingLogs(true);
        try {
            const logsRef = collection(db, "transactions");
            const q = query(
                logsRef,
                where("organizerId", "==", user.uid),
                where("type", "==", "INVOICE_EMISSION"),
                orderBy("createdAt", "desc"),
                limit(20)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLogs(data);
        } catch (error) {
            console.error("Error loading logs:", error);
            showToast.error("Error cargando logs");
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        if (showLogs) {
            loadLogs();
        }
    }, [showLogs]);

    const handleTestConnection = async () => {
        if (!alegraConfig.email || !alegraConfig.token) {
            showToast.error("Ingresa correo y token para probar");
            return;
        }

        setIsTesting(true);
        try {
            const res = await fetch('/api/alegra/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'TEST',
                    email: alegraConfig.email,
                    token: alegraConfig.token,
                    isSandbox: alegraConfig.isSandbox
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showToast.success("¡Conexión exitosa con Alegra!");
                setAlegraConfig(prev => ({ ...prev, isConnected: true }));
            } else {
                showToast.error("Error de conexión: " + (data.error || "Credenciales inválidas"));
                setAlegraConfig(prev => ({ ...prev, isConnected: false }));
            }
        } catch (error) {
            showToast.error("Error al contactar el servidor");
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        if (!alegraConfig.email || !alegraConfig.token) {
            showToast.error("Completa los campos requeridos");
            return;
        }

        setIsSaving(true);
        try {
            // Save to Firestore inside companyData
            // We use merge: true to not overwrite other company fields
            await setDoc(doc(db, "users", user.uid, "companyData", "info"), {
                alegra: alegraConfig,
                nequi: nequiConfig
            }, { merge: true });

            showToast.success("Configuración guardada");
        } catch (error) {
            console.error("Error saving config:", error);
            showToast.error("Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-gray-500">Cargando integraciones...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Integraciones</h2>
                <p className="text-sm text-gray-500 mt-1">Conecta servicios externos para potenciar tu evento</p>
            </div>

            {/* Alegra Card */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setAlegraExpanded(!alegraExpanded)}
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center p-2">
                            <img src="/ico_alegra.png" alt="Alegra" className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = "https://via.placeholder.com/32?text=A"} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                Alegra - Facturación Electrónica
                                {alegraConfig.isConnected ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Conectado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Desconectado
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-500">Emite facturas electrónicas automáticamente ante la DIAN.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://app.alegra.com/configuration/api"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Obtener Token <ExternalLink className="w-3 h-3" />
                        </a>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${alegraExpanded ? 'rotate-90' : ''}`} />
                    </div>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${alegraExpanded ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-4 max-w-2xl border-t border-gray-100 pt-6">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-4">
                            <button
                                className={`py-2 px-4 font-medium text-sm ${!showLogs ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setShowLogs(false)}
                            >
                                Configuración
                            </button>
                            <button
                                className={`py-2 px-4 font-medium text-sm ${showLogs ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setShowLogs(true)}
                            >
                                Logs de API
                            </button>
                        </div>

                        {!showLogs ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Correo de Alegra
                                        </label>
                                        <input
                                            type="email"
                                            value={alegraConfig.email || ""}
                                            onChange={(e) => setAlegraConfig({ ...alegraConfig, email: e.target.value, isConnected: false })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="ejemplo@empresa.com"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Token de API
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={alegraConfig.token || ""}
                                                onChange={(e) => setAlegraConfig({ ...alegraConfig, token: e.target.value, isConnected: false })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                                                placeholder="Copiar desde Alegra > Configuración > API"
                                            />
                                            <Plug className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Entorno
                                        </label>
                                        <select
                                            value={alegraConfig.isSandbox ? "true" : "false"}
                                            onChange={(e) => setAlegraConfig({ ...alegraConfig, isSandbox: e.target.value === "true", isConnected: false })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="true">Sandbox (Pruebas)</option>
                                            <option value="false">Producción (Real)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4">
                                    <button
                                        onClick={handleTestConnection}
                                        disabled={isTesting || !alegraConfig.email || !alegraConfig.token}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
                                    >
                                        {isTesting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Probando...
                                            </>
                                        ) : (
                                            "Probar Conexión"
                                        )}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Guardar Configuración
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-gray-900">Historial de API</h4>
                                    <button onClick={loadLogs} className="text-sm text-indigo-600 hover:text-indigo-700">Actualizar</button>
                                </div>
                                {loadingLogs ? (
                                    <div className="py-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Cargando logs...
                                    </div>
                                ) : logs.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No hay registros recientes</p>
                                ) : (
                                    <div className="space-y-3">
                                        {logs.map((log) => (
                                            <div key={log.id} className={`p-3 rounded-lg border text-sm ${log.status === 'SUCCESS' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`font-bold ${log.status === 'SUCCESS' ? 'text-green-700' : 'text-red-700'}`}>
                                                        {log.status === 'SUCCESS' ? 'Exitoso' : 'Fallido'}
                                                    </span>
                                                    <span className="text-gray-500 text-xs">
                                                        {log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleString() : 'Reciente'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-1">{log.metadata?.description}</p>
                                                {log.metadata?.error && (
                                                    <p className="text-red-600 font-mono text-xs bg-red-100 p-1 rounded mt-1 break-all">
                                                        {typeof log.metadata.error === 'object' ? JSON.stringify(log.metadata.error) : log.metadata.error}
                                                    </p>
                                                )}
                                                {log.alegraId && (
                                                    <p className="text-gray-500 text-xs mt-1">ID Alegra: {log.alegraId}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Nequi Card */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setNequiExpanded(!nequiExpanded)}
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-pink-50 flex items-center justify-center p-2">
                            <img src="/ico_nequi.png" alt="Nequi" className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = "https://via.placeholder.com/32?text=N"} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                Nequi Colombia
                                {nequiConfig.isConnected ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Activo
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Inactivo
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-500">Recibe pagos con notificación Push al celular del cliente.</p>
                        </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${nequiExpanded ? 'rotate-90' : ''}`} />
                </div>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${nequiExpanded ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-4 max-w-2xl border-t border-gray-100 pt-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                                <input
                                    type="text"
                                    value={nequiConfig.clientId}
                                    onChange={(e) => setNequiConfig({ ...nequiConfig, clientId: e.target.value, isConnected: true })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                    placeholder="Tu Client ID de Nequi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                                <input
                                    type="password"
                                    value={nequiConfig.clientSecret}
                                    onChange={(e) => setNequiConfig({ ...nequiConfig, clientSecret: e.target.value, isConnected: true })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                    placeholder="Tu Client Secret"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                <input
                                    type="password"
                                    value={nequiConfig.apiKey}
                                    onChange={(e) => setNequiConfig({ ...nequiConfig, apiKey: e.target.value, isConnected: true })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                    placeholder="Tu API Key"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Guardar Credenciales
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
