"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, collectionGroup } from "firebase/firestore";
import { Event } from "@/types/event";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { ArrowUp, ArrowDown, Calendar as CalendarIcon, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: "index" as const,
            intersect: false,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1f2937",
            bodyColor: "#6b7280",
            borderColor: "#e5e7eb",
            borderWidth: 1,
        },
    },
    scales: {
        x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 12 } } },
        y: { grid: { color: "#f3f4f6" }, ticks: { color: "#9ca3af", font: { size: 12 }, callback: (value: any) => `$${value}` } },
    },
    interaction: { mode: "nearest" as const, axis: "x" as const, intersect: false },
};

export default function DashboardStats() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();

    const dateFilter = searchParams.get("dateFilter") || "year";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // 1. Fetch Events (for names and legacy data)
                const eventsQuery = query(
                    collection(db, "events"),
                    where("organizerId", "==", user.uid)
                );
                const eventsSnapshot = await getDocs(eventsQuery);
                const eventsData = eventsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Event[];
                setEvents(eventsData);

                // 2. Fetch New Attendees (Collection Group)
                const attendeesQuery = query(
                    collectionGroup(db, "attendees"),
                    where("organizerId", "==", user.uid)
                );
                const attendeesSnapshot = await getDocs(attendeesQuery);

                // 3. Merge Data
                const allTransactionsMap = new Map();

                // Add Legacy Data first
                eventsData.forEach(event => {
                    const guests = event.distribution?.uploadedGuests || [];
                    guests.forEach((guest: any) => {
                        if (guest.ticketId) {
                            allTransactionsMap.set(guest.ticketId, {
                                ...guest,
                                eventName: event.name,
                                eventDate: event.date,
                                // Use purchaseDate or event creation date as fallback
                                date: guest.purchaseDate ? new Date(guest.purchaseDate) : (event.createdAt ? new Date(event.createdAt) : new Date())
                            });
                        }
                    });
                });

                // Overwrite with New Data (more recent/accurate)
                attendeesSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    // Try to get eventId from doc ref (parent is 'attendees', parent.parent is eventDoc)
                    const eventId = doc.ref.parent.parent?.id;
                    const event = eventsData.find(e => e.id === eventId);

                    if (data.ticketId) {
                        allTransactionsMap.set(data.ticketId, {
                            ...data,
                            eventName: event?.name || "Evento Desconocido",
                            eventDate: event?.date,
                            date: data.createdAt?.toDate ? data.createdAt.toDate() : (data.purchaseDate ? new Date(data.purchaseDate) : new Date())
                        });
                    }
                });

                const allTransactions = Array.from(allTransactionsMap.values());
                setTransactions(allTransactions);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Filter Logic
    const getFilteredTransactions = () => {
        const now = new Date();
        let startDate = new Date(0); // Beginning of time
        let endDate = new Date();

        if (dateFilter === "week") {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(now.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === "month") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (dateFilter === "quarter") {
            const quarter = Math.floor((now.getMonth() + 3) / 3);
            startDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        } else if (dateFilter === "year") {
            startDate = new Date(now.getFullYear(), 0, 1);
        } else if (dateFilter === "custom" && customStart) {
            startDate = new Date(customStart);
            if (customEnd) endDate = new Date(customEnd);
        }

        return transactions
            .filter(tx => {
                const txDate = new Date(tx.date);
                if (isNaN(txDate.getTime())) return false;
                if (txDate < startDate || txDate > endDate) return false;

                // Include if has price OR has ticketId
                // We need to find the price if it's not in the transaction
                let price = tx.price || 0;
                if (!price && tx.eventName && tx.Zone) {
                    const event = events.find(e => e.name === tx.eventName);
                    const zone = event?.venue?.zones.find(z => z.name === tx.Zone);
                    price = zone?.price || 0;
                }

                // Attach price for downstream aggregation
                tx.price = price;

                return price > 0 || tx.ticketId;
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    };

    const filteredTransactions = getFilteredTransactions();

    // Metrics Calculation
    const totalRevenue = filteredTransactions.reduce((acc, tx) => acc + (tx.price || 0), 0);
    const ticketsSold = filteredTransactions.length;
    const activeEventsCount = events.filter(e => e.status === 'published').length;

    // Chart Data Preparation
    const getChartData = () => {
        const labels: string[] = [];
        const dataPoints: number[] = [];

        // Group by day/month depending on filter
        const groupedData: Record<string, number> = {};

        filteredTransactions.forEach(tx => {
            const dateKey = tx.date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
            groupedData[dateKey] = (groupedData[dateKey] || 0) + (tx.price || 0);
        });

        // Sort keys chronologically (rough approximation for simplicity)
        Object.keys(groupedData).reverse().forEach(key => {
            labels.push(key);
            dataPoints.push(groupedData[key]);
        });

        // If empty, show placeholders
        if (labels.length === 0) {
            return {
                labels: ["Sin datos"],
                datasets: [{
                    label: "Ingresos",
                    data: [0],
                    borderColor: "rgb(99, 102, 241)",
                    backgroundColor: "rgba(99, 102, 241, 0.05)",
                    tension: 0.4,
                    fill: true,
                }]
            };
        }

        return {
            labels,
            datasets: [
                {
                    fill: true,
                    label: "Ingresos",
                    data: dataPoints,
                    borderColor: "rgb(99, 102, 241)",
                    backgroundColor: "rgba(99, 102, 241, 0.05)",
                    tension: 0.4,
                    borderWidth: 2,
                },
            ],
        };
    };

    if (loading) return <div className="p-8 text-center">Cargando tablero...</div>;

    return (
        <div className="space-y-5">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
                {/* Filters moved to TopBar */}
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Ingresos Totales", value: `$${totalRevenue.toLocaleString()}`, icon: "💰", color: "bg-emerald-50 text-emerald-600" },
                    { title: "Entradas Vendidas", value: ticketsSold, icon: "🎟️", color: "bg-blue-50 text-blue-600" },
                    { title: "Eventos Activos", value: activeEventsCount, icon: "📅", color: "bg-purple-50 text-purple-600" },
                    { title: "Promedio Ticket", value: `$${ticketsSold > 0 ? Math.round(totalRevenue / ticketsSold).toLocaleString() : 0}`, icon: "📈", color: "bg-orange-50 text-orange-600" },
                ].map((metric, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-2">
                            <div className={`rounded-lg p-1.5 text-lg ${metric.color}`}>{metric.icon}</div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide font-semibold">{metric.title}</p>
                            <h3 className="text-xl font-bold text-gray-900">{metric.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Chart Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Rendimiento de Ventas</h3>
                        <p className="text-xs text-gray-500">Ingresos en el periodo seleccionado</p>
                    </div>
                    <div className="h-80 w-full">
                        <Line options={chartOptions} data={getChartData()} />
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm overflow-hidden">
                    <h3 className="mb-5 text-lg font-bold text-gray-900">Actividad Reciente</h3>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.slice(0, 6).map((tx, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                                            {tx.Name?.charAt(0) || "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {tx.Name || "Usuario"} <span className="text-gray-400 font-normal">compró entrada</span>
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{tx.eventName}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-600 shrink-0">+${tx.price?.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-8">No hay actividad en este periodo</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
