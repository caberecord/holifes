"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, FileText, LogOut, ShieldAlert, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { appUser, loading, logout } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!appUser || appUser.role !== 'superadmin') {
                // Redirect unauthorized users
                router.push("/dashboard");
            }
        }
    }, [appUser, loading, router]);

    if (loading || !appUser || appUser.role !== 'superadmin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="animate-pulse flex flex-col items-center">
                    <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
                    <p>Verifying God Mode Access...</p>
                </div>
            </div>
        );
    }

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
        { icon: Users, label: "Usuarios", href: "/admin/users" },
        { icon: FileText, label: "Auditoría Eventos", href: "/admin/events" },
        { icon: Settings, label: "Config. Planes", href: "/admin/plans" },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex">
            {/* Admin Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/50 backdrop-blur-xl border-r border-red-900/30 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="p-6 border-b border-red-900/30 flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-wider text-red-500">GOD MODE</h1>
                        <p className="text-xs text-gray-500">Super Admin</p>
                    </div>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-red-900/30">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
