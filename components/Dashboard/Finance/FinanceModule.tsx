"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Event } from "@/types/event";
import { DollarSign, CreditCard, Wallet, TrendingUp, Filter, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function FinanceModule() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState<string>("all");

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user) return;

            try {
                // Fetch events filtered by organizerId
                const q = query(
                    collection(db, "events"),
                    where("organizerId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const eventsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Event[];
                setEvents(eventsData);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [user]);

    // Filter logic
    const filteredEvents = selectedEventId === "all"
        ? events
        : events.filter(e => e.id === selectedEventId);

    // Aggregation Logic
    let totalRevenue = 0;
    let cashBalance = 0;
    let bankBalance = 0; // Nequi, Daviplata, PSE, Tarjeta, Transferencia
    let totalTicketsSold = 0;

    const salesByMethod: Record<string, number> = {};
    const recentTransactions: any[] = [];

    filteredEvents.forEach(event => {
        const attendees = event.distribution?.uploadedGuests || [];

        attendees.forEach(guest => {
            // Only count if it has a payment method (implies it was sold via POS or verified)
            // Or if it has a price associated (legacy data might need handling)
            if (guest.paymentMethod || guest.ticketId) {
                const zone = event.venue?.zones.find(z => z.name === guest.Zone);
                const price = zone?.price || 0;

                if (price > 0) {
                    totalRevenue += price;
                    totalTicketsSold++;

                    const method = guest.paymentMethod || "Desconocido";
                    salesByMethod[method] = (salesByMethod[method] || 0) + price;

                    if (method === "Efectivo") {
                        cashBalance += price;
                    } else if (method !== "Desconocido") {
                        bankBalance += price;
                    }

                    // Add to transactions list
                    recentTransactions.push({
                        id: guest.ticketId || Math.random().toString(),
                        date: event.createdAt || event.date, // Fallback
                        eventName: event.name,
                        buyer: guest.Name,
                        amount: price,
                        method: method,
                        status: "Completado"
                    });
                }
            }
        });
    });

    // Sort transactions by date (newest first)
    recentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Prepare Chart Data
    const chartData = Object.entries(salesByMethod).map(([name, value]) => ({
        name,
        value,
        percentage: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    if (loading) return <div className="p-8 text-center">Cargando finanzas...</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="pl-9 pr-8 py-2 rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">Todos los Eventos</option>
                            {events.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-green-600 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +100%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500">Ingresos Totales Recaudados</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Caja Menor</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">${cashBalance.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500">Saldo en Efectivo (Caja)</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Bancos/Digital</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">${bankBalance.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500">Transferencias, Nequi, Tarjetas</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Distribución por Método</h3>
                    <div className="space-y-4">
                        {chartData.length > 0 ? (
                            chartData.map((item, index) => (
                                <div key={item.name}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{item.name}</span>
                                        <span className="text-gray-500">${item.value.toLocaleString()} ({item.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${item.name === 'Efectivo' ? 'bg-green-500' :
                                                item.name === 'Nequi' ? 'bg-purple-600' :
                                                    item.name === 'Daviplata' ? 'bg-red-500' :
                                                        'bg-blue-500'
                                                }`}
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-8">No hay datos financieros aún</p>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Tickets Vendidos</span>
                            <span className="text-lg font-bold text-gray-900">{totalTicketsSold}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">Promedio por Ticket</span>
                            <span className="text-lg font-bold text-gray-900">
                                ${totalTicketsSold > 0 ? Math.round(totalRevenue / totalTicketsSold).toLocaleString() : 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Transacciones Recientes</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3">Evento</th>
                                    <th className="px-4 py-3">Comprador</th>
                                    <th className="px-4 py-3">Método</th>
                                    <th className="px-4 py-3 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.slice(0, 10).map((tx, i) => (
                                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500">
                                                {tx.date ? new Date(tx.date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{tx.eventName}</td>
                                            <td className="px-4 py-3 text-gray-600">{tx.buyer}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.method === 'Efectivo' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {tx.method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                ${tx.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                            No hay transacciones recientes
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
