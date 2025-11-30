"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Dashboard/Sidebar";
import TopBar from "@/components/Dashboard/TopBar";
import { useTranslations } from 'next-intl';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isStaff, loading } = useAuth();
    const router = useRouter();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const t = useTranslations('DashboardLayout');

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }

        // Redirect staff users to check-in page
        if (!loading && user && isStaff) {
            router.push("/checkin");
        }
    }, [user, isStaff, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-lg text-gray-600">{t('loading')}</div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar
                isMobileOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
            />
            <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
                <TopBar onMenuClick={() => setIsMobileSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
