"use client";
import { useEffect, useState } from "react";
import { DollarSign, Users, TrendingUp, Ticket, Calendar } from "lucide-react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        newUsers: 0,
        totalEvents: 0,
        publishedEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            // 1. Fetch Users
            const usersSnapshot = await getDocs(collection(db, "users"));
            const totalUsers = usersSnapshot.size;

            // Calculate new users (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const newUsers = usersSnapshot.docs.filter(doc => {
                const data = doc.data();
                return data.createdAt && data.createdAt.toDate() > thirtyDaysAgo;
            }).length;

            // 2. Fetch Events
            const eventsSnapshot = await getDocs(collection(db, "events"));
            const totalEvents = eventsSnapshot.size;

            let publishedEvents = 0;
            let totalTicketsSold = 0;
            let totalRevenue = 0;

            eventsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'published') publishedEvents++;

                // Sum tickets sold (assuming 'soldCount' exists on event or calculating from attendees subcollection would be too expensive here)
                // For MVP, we'll rely on a 'soldCount' field if it exists, or 0
                const sold = data.soldCount || 0;
                totalTicketsSold += sold;

                // Calculate revenue (simplified: 5% commission on ticket sales if price > 0)
                // This is an ESTIMATE based on business rules, not actual transaction ledger
                if (data.ticketPrice > 0) {
                    const eventRevenue = sold * data.ticketPrice;
                    const commission = eventRevenue * 0.05; // 5% commission
                    totalRevenue += commission;
                }
            });

            setMetrics({
                totalUsers,
                newUsers,
                totalEvents,
                publishedEvents,
                totalTicketsSold,
                totalRevenue
            });

        } catch (error) {
            console.error("Error loading metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            title: "Ingresos Estimados (5%)",
            value: `$${metrics.totalRevenue.toLocaleString()}`,
            change: "+0%", // To be implemented with historical data
            trend: "neutral",
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Usuarios Totales",
            value: metrics.totalUsers.toLocaleString(),
            change: `+${metrics.newUsers} este mes`,
            trend: "up",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Eventos Publicados",
            value: metrics.publishedEvents.toLocaleString(),
            change: `${((metrics.publishedEvents / (metrics.totalEvents || 1)) * 100).toFixed(1)}% del total`,
            trend: "up",
            icon: Calendar,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "Tickets Vendidos",
            value: metrics.totalTicketsSold.toLocaleString(),
            change: "Global",
            trend: "up",
            icon: Ticket,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
    ];

    if (loading) {
        return <div className="text-white p-8">Cargando métricas del sistema...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Dashboard General</h2>
                <p className="text-gray-400 mt-1">Vista general del rendimiento de la plataforma.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-gray-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity & Charts Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 h-80 flex items-center justify-center text-gray-500">
                    Gráfico de Ingresos (Próximamente)
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 h-80 flex items-center justify-center text-gray-500">
                    Actividad Reciente (Próximamente)
                </div>
            </div>
        </div>
    );
}
