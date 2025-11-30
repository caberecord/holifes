"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import POSModule from "@/components/Dashboard/Sales/POSModule";
import { Loader2, ShieldAlert } from "lucide-react";

export default function SalesPage() {
    const { appUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && appUser) {
            const isStaff = appUser.role === 'staff';
            const canSell = appUser.permissions?.canSell;

            if (isStaff && !canSell) {
                // Redirect or just let the UI show denied
            }
        }
    }, [appUser, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    // Permission Check
    if (appUser?.role === 'staff' && !appUser?.permissions?.canSell) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
                <p className="text-gray-500 max-w-md">
                    No tienes permisos para acceder al Punto de Venta. Contacta al administrador de tu organización.
                </p>
            </div>
        );
    }

    return <POSModule />;
}
