"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { db } from "../../../../lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { TransactionLog } from "../../../../lib/transactions";
import { Loader2, FileText, DollarSign, AlertCircle, CheckCircle2, XCircle, Search } from "lucide-react";

export default function TransactionsPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<TransactionLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("ALL");

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTransactions();
    }, [user, filterType]);

    const loadTransactions = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);
        try {
            const transactionsRef = collection(db, "transactions");
            let q = query(
                transactionsRef,
                where("organizerId", "==", user.uid),
                orderBy("createdAt", "desc"),
                limit(50)
            );

            if (filterType !== "ALL") {
                q = query(
                    transactionsRef,
                    where("organizerId", "==", user.uid),
                    where("type", "==", filterType),
                    orderBy("createdAt", "desc"),
                    limit(50)
                );
            }

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as TransactionLog));
            setTransactions(data);
        } catch (error: any) {
            console.error("Error loading transactions:", error);
            setError(error.message || "Error al cargar transacciones");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'FAILED': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'PENDING': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'SALE': return 'Venta Ticket';
            case 'INVOICE_EMISSION': return 'Emisión Factura';
            case 'PAYMENT_REGISTRATION': return 'Registro Pago';
            case 'CREDIT_NOTE': return 'Nota Crédito';
            case 'REFUND': return 'Reembolso';
            default: return type;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Transacciones y Auditoría</h1>
                <p className="text-gray-500">Registro detallado de movimientos financieros y facturación</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="ALL">Todas las transacciones</option>
                    <option value="SALE">Ventas</option>
                    <option value="INVOICE_EMISSION">Facturación (Alegra)</option>
                    <option value="PAYMENT_REGISTRATION">Pagos</option>
                    <option value="CREDIT_NOTE">Notas de Crédito</option>
                </select>
                <button
                    onClick={loadTransactions}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    title="Recargar"
                >
                    <Search className="w-5 h-5" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-700">Estado</th>
                                <th className="px-6 py-4 font-medium text-gray-700">Tipo</th>
                                <th className="px-6 py-4 font-medium text-gray-700">Fecha</th>
                                <th className="px-6 py-4 font-medium text-gray-700">Descripción</th>
                                <th className="px-6 py-4 font-medium text-gray-700 text-right">Monto</th>
                                <th className="px-6 py-4 font-medium text-gray-700">Ref. Externa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Cargando registros...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                                        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                                        {error}
                                        {error.includes("index") && (
                                            <p className="text-xs mt-2 text-gray-500">
                                                Es posible que falte un índice en Firebase. Revisa la consola del navegador para el enlace de creación.
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No hay transacciones registradas
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(tx.status)}
                                                <span className={`font-medium ${tx.status === 'SUCCESS' ? 'text-green-700' :
                                                    tx.status === 'FAILED' ? 'text-red-700' : 'text-yellow-700'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {getTypeLabel(tx.type)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'Reciente'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={tx.metadata.description}>
                                            {tx.metadata.description}
                                            {tx.metadata.error && (
                                                <div className="text-xs text-red-500 mt-1 truncate">
                                                    {tx.metadata.error}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium">
                                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: tx.currency }).format(tx.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {tx.alegraId || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
