import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Shield, User, Clock, FileText, Smartphone, QrCode, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { getEventScanLogs } from "@/lib/checkin/audit";
import { ScanLog } from "@/types/audit";

interface AuditTabProps {
    eventId: string;
}

type AuditAction = 'UPDATE_EVENT_DETAILS' | 'UPDATE_VENUE_MAP' | 'UPDATE_PLAN' | 'UPDATE_DISTRIBUTION' | 'UPLOAD_COVER_IMAGE';

interface AuditLog {
    id: string;
    eventId: string;
    action: AuditAction;
    userId: string;
    details?: any;
    timestamp: any;
    userAgent: string;
}

export default function AuditTab({ eventId }: AuditTabProps) {
    const [activeTab, setActiveTab] = useState<'changes' | 'access'>('changes');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingScans, setLoadingScans] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!eventId) return;
            setLoading(true);
            try {
                const q = query(
                    collection(db, "audit_logs"),
                    where("eventId", "==", eventId),
                    orderBy("timestamp", "desc"),
                    limit(50)
                );

                const querySnapshot = await getDocs(q);
                const fetchedLogs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as AuditLog));

                setLogs(fetchedLogs);
            } catch (error) {
                console.error("Error fetching audit logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [eventId]);

    useEffect(() => {
        const fetchScanLogs = async () => {
            if (activeTab === 'access' && eventId) {
                setLoadingScans(true);
                try {
                    const logs = await getEventScanLogs(eventId, 100);
                    setScanLogs(logs);
                } catch (error) {
                    console.error("Error fetching scan logs:", error);
                } finally {
                    setLoadingScans(false);
                }
            }
        };

        fetchScanLogs();
    }, [activeTab, eventId]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "-";
        // Handle Firestore Timestamp
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    };

    const getActionLabel = (action: AuditAction) => {
        switch (action) {
            case 'UPDATE_EVENT_DETAILS': return 'Actualización de Detalles';
            case 'UPDATE_VENUE_MAP': return 'Actualización del Mapa';
            case 'UPDATE_PLAN': return 'Cambio de Plan';
            case 'UPDATE_DISTRIBUTION': return 'Cambio en Distribución';
            case 'UPLOAD_COVER_IMAGE': return 'Nueva Imagen de Portada';
            default: return action;
        }
    };

    const getScanResultLabel = (result: string) => {
        switch (result) {
            case 'success': return { label: 'Acceso Permitido', color: 'text-green-600 bg-green-50', icon: <CheckCircle className="w-4 h-4" /> };
            case 'duplicate_attempt': return { label: 'Intento Duplicado', color: 'text-amber-600 bg-amber-50', icon: <AlertTriangle className="w-4 h-4" /> };
            case 'invalid_signature': return { label: 'Firma Inválida', color: 'text-red-600 bg-red-50', icon: <XCircle className="w-4 h-4" /> };
            case 'wrong_event': return { label: 'Evento Incorrecto', color: 'text-red-600 bg-red-50', icon: <XCircle className="w-4 h-4" /> };
            case 'ticket_not_found': return { label: 'Ticket No Encontrado', color: 'text-red-600 bg-red-50', icon: <XCircle className="w-4 h-4" /> };
            default: return { label: result, color: 'text-gray-600 bg-gray-50', icon: <AlertTriangle className="w-4 h-4" /> };
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-indigo-600" />
                        Registro de Auditoría
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Historial de cambios y accesos del evento.</p>
                </div>

                <div className="flex p-1 bg-gray-100 rounded-lg self-start sm:self-auto">
                    <button
                        onClick={() => setActiveTab('changes')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'changes'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Cambios del Evento
                    </button>
                    <button
                        onClick={() => setActiveTab('access')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'access'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Registros de Acceso
                    </button>
                </div>
            </div>

            {activeTab === 'changes' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Acción</th>
                                <th className="px-6 py-3">Usuario</th>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Cargando registros...
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No hay registros de auditoría para este evento.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {getActionLabel(log.action)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 flex items-center">
                                            <User className="w-4 h-4 mr-2 text-gray-400" />
                                            {log.userId.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                {formatDate(log.timestamp)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {log.details ? (
                                                <div className="max-w-xs truncate" title={JSON.stringify(log.details, null, 2)}>
                                                    <FileText className="w-4 h-4 inline mr-1 text-gray-400" />
                                                    {Object.keys(log.details).join(", ")}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'access' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Resultado</th>
                                <th className="px-6 py-3">Ticket ID</th>
                                <th className="px-6 py-3">Escaneado Por</th>
                                <th className="px-6 py-3">Fecha y Hora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingScans ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Cargando escaneos...
                                        </div>
                                    </td>
                                </tr>
                            ) : scanLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No hay registros de acceso para este evento.
                                    </td>
                                </tr>
                            ) : (
                                scanLogs.map((log) => {
                                    const resultInfo = getScanResultLabel(log.result);
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resultInfo.color}`}>
                                                    {resultInfo.icon}
                                                    <span className="ml-1.5">{resultInfo.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                                <div className="flex items-center">
                                                    <QrCode className="w-4 h-4 mr-2 text-gray-400" />
                                                    {log.ticketId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center">
                                                    <Smartphone className="w-4 h-4 mr-2 text-gray-400" />
                                                    {log.scannerName || 'Desconocido'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                    {formatDate(log.timestamp)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
