"use client";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { Menu } from "lucide-react";
import { OrganizationSwitcher } from "@/features/organizations/components";
import { useTranslations } from 'next-intl';
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

const Icons = {
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
};

interface TopBarProps {
    onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('TopBar');

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(name, value);
        return params.toString();
    };

    const handleDateFilterChange = (value: string) => {
        router.push(`${pathname}?${createQueryString("dateFilter", value)}`);
    };

    const getPageHeader = (path: string) => {
        if (path.startsWith("/dashboard/settings")) {
            const view = searchParams.get("view");
            if (view === "profile") return { title: t('headers.profile.title'), subtitle: t('headers.profile.subtitle') };
            if (view === "team") return { title: t('headers.team.title'), subtitle: t('headers.team.subtitle') };
            if (view === "organization") return { title: t('headers.organization.title'), subtitle: t('headers.organization.subtitle') };
            if (view === "account") return { title: t('headers.account.title'), subtitle: t('headers.account.subtitle') };
            if (view === "integrations") return { title: t('headers.integrations.title'), subtitle: t('headers.integrations.subtitle') };

            return {
                title: t('headers.settings.title'),
                subtitle: t('headers.settings.subtitle')
            };
        }
        if (path.startsWith("/dashboard/events")) return {
            title: t('headers.events.title'),
            subtitle: t('headers.events.subtitle')
        };
        if (path.startsWith("/dashboard/sales")) return {
            title: t('headers.pos.title'),
            subtitle: t('headers.pos.subtitle')
        };
        if (path.startsWith("/dashboard/contacts")) return {
            title: t('headers.contacts.title'),
            subtitle: t('headers.contacts.subtitle')
        };
        if (path.startsWith("/dashboard/finance")) return {
            title: t('headers.finance.title'),
            subtitle: t('headers.finance.subtitle')
        };
        return { title: t('headers.dashboard.title'), subtitle: t('headers.dashboard.subtitle') };
    };

    const { title, subtitle } = getPageHeader(pathname);

    return (
        <header className="flex h-14 sm:h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8">
            <div className="flex items-center gap-3">
                {/* Hamburger Menu - Mobile Only */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="flex flex-col">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{title}</h2>
                    {subtitle && (
                        <p className="hidden md:block text-xs text-gray-500">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Date Filter - Dashboard Only */}
                {pathname === "/dashboard" && (
                    <div className="hidden md:block">
                        <select
                            value={searchParams.get("dateFilter") || "year"}
                            onChange={(e) => handleDateFilterChange(e.target.value)}
                            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                        >
                            <option value="all">{t('filters.allTime')}</option>
                            <option value="week">{t('filters.thisWeek')}</option>
                            <option value="month">{t('filters.thisMonth')}</option>
                            <option value="quarter">{t('filters.thisQuarter')}</option>
                            <option value="year">{t('filters.thisYear')}</option>
                        </select>
                    </div>
                )}

                {/* Search - Hidden on small mobile */}
                <div className="relative hidden sm:block">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Icons.Search />
                    </div>
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        className="h-10 w-48 md:w-64 rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>

                {/* Notifications */}
                <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                    <Icons.Bell />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                {/* Locale Switcher */}
                <div className="hidden sm:block">
                    <LocaleSwitcher />
                </div>

                {/* Organization Switcher */}
                <OrganizationSwitcher />

                {/* Create Event Button */}
                <Link
                    href="/dashboard/create"
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                    <Icons.Plus />
                    <span className="hidden xs:inline">{t('createEvent')}</span>
                </Link>
            </div>
        </header>
    );
}
