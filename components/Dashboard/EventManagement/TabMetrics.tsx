"use client";
import { Event } from "../../../types/event";
import { Users, Ticket, DollarSign, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

interface TabMetricsProps {
    event: Event;
}

export default function TabMetrics({ event }: TabMetricsProps) {
    const [recentSales, setRecentSales] = useState<any[]>([]);

    useEffect(() => {
        const fetchRecentSales = async () => {
            if (!event.id) return;
            try {
                const q = query(collection(db, "events", event.id, "attendees"), orderBy("createdAt", "desc"), limit(5));
                const snapshot = await getDocs(q);
                const sales = snapshot.docs.map(doc => ({ id: doc.data().createdAt?.toMillis?.() || Date.now(), ...doc.data() }));
                setRecentSales(sales);
            } catch (error) {
                console.error("Error fetching recent sales:", error);
                // Fallback to legacy
                if (event.distribution?.uploadedGuests) {
                    setRecentSales([...event.distribution.uploadedGuests].sort((a, b) => b.id - a.id).slice(0, 5));
                }
            }
        };
        fetchRecentSales();
    }, [event.id]);

    // Calculate metrics using stats (or fallback)
    const soldTickets = event.stats?.totalSold ?? event.distribution?.uploadedGuests?.length ?? 0;
    const totalCapacity = event.venue?.totalCapacity || 0;
    const availableTickets = Math.max(0, totalCapacity - soldTickets);

    // Revenue
    const revenue = event.stats?.totalRevenue ?? event.distribution?.uploadedGuests?.reduce((acc, guest) => {
        const zone = event.venue?.zones.find(z => z.name === guest.Zone);
        return acc + (zone?.price || 0);
    }, 0) ?? 0;

    // Conversion
    const conversionRate = totalCapacity > 0 ? Math.round((soldTickets / totalCapacity) * 100) : 0;

    const stats = [
        { name: 'Entradas Vendidas', value: soldTickets, icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Disponibles', value: availableTickets, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
        { name: 'Ingresos Totales', value: `$${revenue.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { name: 'Tasa de Conversión', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    // Calculate occupancy per zone
    const zoneOccupancy = event.venue?.zones.map(zone => {
        const count = event.stats?.soldByZone?.[zone.name] ?? event.distribution?.uploadedGuests?.filter(a => a.Zone === zone.name).length ?? 0;
        const percentage = zone.capacity > 0 ? Math.round((count / zone.capacity) * 100) : 0;
        return { ...zone, count, percentage };
    }) || [];

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Total</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.name}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Capacity Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Ocupación por Zona</h3>
                    <div className="space-y-4">
                        {zoneOccupancy.length > 0 ? (
                            zoneOccupancy.map((zone) => (
                                <div key={zone.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{zone.name}</span>
                                        <span className="text-gray-500">{zone.percentage}% ({zone.count}/{zone.capacity})</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="h-2.5 rounded-full"
                                            style={{
                                                width: `${Math.min(zone.percentage, 100)}%`,
                                                backgroundColor: zone.color || '#4f46e5'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4">No hay zonas configuradas</p>
                        )}
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Ventas Recientes</h3>
                    <div className="space-y-4">
                        {recentSales.length > 0 ? (
                            recentSales.map((sale) => {
                                const zone = event.venue?.zones.find(z => z.name === sale.Zone);
                                const price = zone?.price || 0;
                                const timeAgo = Math.floor((Date.now() - sale.id) / 60000); // minutes

                                return (
                                    <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {sale.Name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{sale.Name || "Desconocido"}</p>
                                                <p className="text-xs text-gray-500">
                                                    {timeAgo < 60 ? `Hace ${timeAgo} min` : `Hace ${Math.floor(timeAgo / 60)} horas`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-green-600">+ ${price}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4">No hay ventas recientes</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
