"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useTransition } from "react";

export default function LocaleSwitcher() {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            // Replace the locale in the pathname
            // Assuming pathname starts with /[locale]/...
            // If we are using next-intl middleware, we might need a different approach
            // But typically replacing the first segment works if it's strictly /[locale]

            // However, a safer way with next-intl is often to just push the new locale
            // if we are using the localized navigation wrappers.
            // Since we are using standard next/navigation here, let's construct the path manually.

            const segments = pathname.split('/');
            segments[1] = nextLocale;
            const newPath = segments.join('/');

            router.replace(newPath);
        });
    };

    return (
        <label className="relative inline-flex items-center">
            <span className="sr-only">{t('label')}</span>
            <select
                defaultValue={locale}
                className="bg-transparent py-1 pl-2 pr-6 text-sm font-medium text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-0 cursor-pointer appearance-none"
                onChange={onSelectChange}
                disabled={isPending}
            >
                <option value="es">🇪🇸 ES</option>
                <option value="en">🇺🇸 EN</option>
                <option value="pt">🇧🇷 PT</option>
            </select>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                ▼
            </span>
        </label>
    );
}
