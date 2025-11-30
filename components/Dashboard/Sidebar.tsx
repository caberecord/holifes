"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { X, Shield, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

// --- COMPONENTE LOGO ---
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], weight: ["700", "900"] });

// --- COMPONENTE LOGO ---
const SidebarLogo = () => {
    const [key, setKey] = useState(0);

    useEffect(() => {
        // Se repite cada 10 minutos (10 * 60 * 1000 = 600,000 ms)
        const interval = setInterval(() => {
            setKey(prev => prev + 1);
        }, 600000);

        return () => clearInterval(interval);
    }, []);

    // Icono de estrella SVG
    const StarIcon = ({ className }: { className?: string }) => (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M50 15 L50 85" className="origin-center" />
            <path d="M15 50 L85 50" className="origin-center" />
            <path d="M25 25 L75 75" className="origin-center" />
            <path d="M75 25 L25 75" className="origin-center" />
        </svg>
    );

    return (
        <div className="flex items-center justify-center select-none w-full">
            <h1 key={key} className={`text-4xl font-extrabold tracking-tight text-gray-800 relative leading-none flex items-baseline ${nunito.className}`}>
                {['h', 'o', 'l', 'i', 'f', 'e', 's'].map((letter, index) => {
                    const isI = letter === 'i';

                    return (
                        <span
                            key={index}
                            className="inline-block relative animate-bounce-sidebar"
                            style={{
                                animationDelay: `${index * 0.08}s`,
                            }}
                        >
                            {isI ? (
                                <div className="flex flex-col items-center justify-end relative">
                                    {/* Estrella como punto de la i - Ajustada posición a -top-[0.28em] para que esté pegada */}
                                    <span className="absolute -top-[0.28em] w-[0.45em] h-[0.45em] text-[#FF9F68]">
                                        <StarIcon className="w-full h-full drop-shadow-[0_0_3px_rgba(255,159,104,0.6)]" />
                                    </span>
                                    {/* Tallo de la i */}
                                    <span>ı</span>
                                </div>
                            ) : (
                                letter
                            )}
                        </span>
                    );
                })}
            </h1>

            <style>{`
        @keyframes bounce-sidebar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .animate-bounce-sidebar {
          animation-name: bounce-sidebar;
          animation-duration: 0.6s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: 2;
          animation-fill-mode: forwards;
        }
      `}</style>
        </div>
    );
};

// Simple SVG Icons
const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    BarChart: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
    ),
    Wallet: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
    ),
    Settings: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    LogOut: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
    ),
};

interface SidebarProps {
    isMobileOpen: boolean;
    onClose: () => void;
}

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Icons.Dashboard, roleRequired: null },
    { name: "Mis Eventos", href: "/dashboard/events", icon: Icons.Calendar, roleRequired: null },
    { name: "Punto de Venta", href: "/dashboard/sales", icon: () => <CreditCard className="w-5 h-5" />, roleRequired: null },
    { name: "Contactos", href: "/dashboard/contacts", icon: Icons.Users, roleRequired: null },
    { name: "Finanzas", href: "/dashboard/finance", icon: Icons.Wallet, roleRequired: null },
    { name: "Configuración", href: "/dashboard/settings", icon: Icons.Settings, roleRequired: null },
];

export default function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, appUser, isOrganizer, isStaff, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50
                flex h-full shrink-0 flex-col bg-white border-r border-gray-200
                transform transition-all duration-300 ease-in-out lg:transform-none
                ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
                ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
            `}>
                <div className={`relative flex ${isCollapsed ? 'flex-col justify-center h-auto py-4 gap-2' : 'items-center justify-center h-16'} px-3 border-b border-gray-200 bg-white transition-all duration-300`}>
                    <div className="flex items-center justify-center w-full">
                        {isCollapsed ? (
                            <img src="/favicon.ico" alt="H" className="h-8 w-auto" />
                        ) : (
                            <SidebarLogo />
                        )}
                    </div>

                    <div className={`${isCollapsed ? 'flex justify-center' : 'absolute right-3 flex top-1/2 -translate-y-1/2'} items-center gap-2`}>
                        {/* Collapse Toggle Button (Desktop Only) */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>

                        {/* Mobile Close Button */}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                    {navigation
                        .filter(item => !item.roleRequired || (item.roleRequired === "organizer" && isOrganizer))
                        .map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => onClose()}
                                    title={isCollapsed ? item.name : ""}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${isActive
                                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                >
                                    <Icon />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </Link>
                            );
                        })}


                    {/* Super Admin Link */}
                    {appUser?.role === 'superadmin' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Administración
                            </p>
                            <Link
                                href="/admin"
                                onClick={() => onClose()}
                                title={isCollapsed ? "Super Admin" : ""}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-150 ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Shield className="w-5 h-5" />
                                {!isCollapsed && <span>Super Admin</span>}
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="border-t border-gray-200 p-4">
                    <Link
                        href="/dashboard/settings?view=profile"
                        onClick={() => onClose()}
                        className={`flex items-center gap-3 rounded-lg bg-gray-50 p-3 hover:bg-gray-100 transition-all duration-150 group cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                            {appUser?.photoURL ? (
                                <img
                                    src={appUser.photoURL}
                                    alt={appUser.displayName || "User"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                user?.email?.charAt(0).toUpperCase() || "U"
                            )}
                        </div>

                        {!isCollapsed && (
                            <>
                                <div className="flex-1 overflow-hidden transition-opacity duration-300">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {user?.email?.split('@')[0] || "Usuario"}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">Organizador Pro</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        logout();
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Cerrar Sesión"
                                >
                                    <Icons.LogOut />
                                </button>
                            </>
                        )}
                    </Link>
                </div>
            </div >
        </>
    );
}
