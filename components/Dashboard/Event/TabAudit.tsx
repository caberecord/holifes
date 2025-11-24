import { useState, useEffect } from 'react';
import { ScanLog } from '../../../types/audit';
import { getEventScanLogs } from '../../../lib/checkin/audit';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { RefreshCw, Search, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TabAuditProps {
    eventId: string;
}

export default function TabAudit({ eventId }: TabAuditProps) {
    const [logs, setLogs] = useState<ScanLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            console.log('Fetching scan logs for event:', eventId);
            const data = await getEventScanLogs(eventId);
            console.log('Scan logs fetched:', data.length, 'records');
            setLogs(data);
        } catch (error) {
            console.error('Error fetching scan logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [eventId]);

    const filteredLogs = logs.filter(log =>
        log.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.scannerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getResultIcon = (result: string) => {
        switch (result) {
            case 'success':
            case 'legacy_success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'duplicate_attempt':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'invalid_signature':
            case 'wrong_event':
            case 'ticket_not_found':
            case 'format_error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertTriangle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getResultText = (result: string) => {
        switch (result) {
            case 'success': return 'Exitoso';
            case 'legacy_success': return 'Exitoso (Antiguo)';
            case 'duplicate_attempt': return 'Duplicado';
            case 'invalid_signature': return 'Firma Inválida';
            case 'wrong_event': return 'Evento Incorrecto';
            case 'ticket_not_found': return 'No Encontrado';
            case 'format_error': return 'Error de Formato';
            default: return result;
        }
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case 'success':
            case 'legacy_success':
                return 'text-green-400';
            case 'duplicate_attempt':
                return 'text-yellow-400';
            default:
                return 'text-red-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb / Location Indicator */}
            <div className="text-sm text-gray-500">
                Dashboard / Editar Evento / <span className="text-gray-700 font-medium">Auditoría de Escaneos</span>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Registro de Auditoría</h2>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por ticket o staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Hora</th>
                                <th className="px-6 py-4">Resultado</th>
                                <th className="px-6 py-4">Ticket ID</th>
                                <th className="px-6 py-4">Falla / Detalle</th>
                                <th className="px-6 py-4">Staff</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Cargando registros...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        No se encontraron registros
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {log.timestamp ? format(
                                                log.timestamp instanceof Date ? log.timestamp : log.timestamp.toDate(),
                                                'dd/MM HH:mm:ss',
                                                { locale: es }
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getResultIcon(log.result)}
                                                <span className={`font-medium ${getResultColor(log.result)}`}>
                                                    {getResultText(log.result)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-gray-900">{log.ticketId}</div>
                                            {log.metadata?.isLegacyQR && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Antiguo</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {log.failureReason || '-'}
                                            {log.previousCheckIn && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Registrado: {format(
                                                        log.previousCheckIn.timestamp instanceof Date ? log.previousCheckIn.timestamp : log.previousCheckIn.timestamp.toDate(),
                                                        'dd/MM HH:mm',
                                                        { locale: es }
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {log.scannerName || log.scannerId}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-sm text-gray-500 text-right">
                Total de registros: {filteredLogs.length}
            </div>
        </div>
    );
}
