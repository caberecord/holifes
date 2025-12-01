"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// SVG Flags
const FlagCO = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-5 h-3.5 rounded-sm shadow-sm object-cover">
        <rect width="900" height="600" fill="#CE1126" />
        <rect width="900" height="400" fill="#003893" />
        <rect width="900" height="300" fill="#FCD116" />
    </svg>
);

const FlagUS = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1235 650" className="w-5 h-3.5 rounded-sm shadow-sm object-cover">
        <rect width="1235" height="650" fill="#B22234" />
        <path d="M0,0H1235V50H0M0,100H1235V150H0M0,200H1235V250H0M0,300H1235V350H0M0,400H1235V450H0M0,500H1235V550H0M0,600H1235V650H0" fill="#FFF" />
        <rect width="494" height="350" fill="#3C3B6E" />
        {/* Simplified stars for small size */}
        <path fill="#FFF" d="M247 175l5 15h16l-13 9 5 15-13-9-13 9 5-15-13-9h16z" />
    </svg>
);

const FlagBR = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" className="w-5 h-3.5 rounded-sm shadow-sm object-cover">
        <rect width="1000" height="700" fill="#009c3b" />
        <path d="M500,113 L887,350 L500,587 L113,350 Z" fill="#ffdf00" />
        <circle cx="500" cy="350" r="125" fill="#002776" />
        <path d="M380,370 C380,370 450,330 620,370" stroke="#FFF" strokeWidth="10" fill="none" />
    </svg>
);

const languages = [
    { code: 'es', label: 'CO', flag: FlagCO },
    { code: 'en', label: 'EN', flag: FlagUS },
    { code: 'pt', label: 'PT', flag: FlagBR },
];

export default function LocaleSwitcher() {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onSelectChange = (nextLocale: string) => {
        setIsOpen(false);
        startTransition(() => {
            const segments = pathname.split('/');
            segments[1] = nextLocale;
            const newPath = segments.join('/');
            router.replace(newPath);
        });
    };

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className="inline-flex items-center gap-2 justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <currentLang.flag />
                <span>{currentLang.label}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => onSelectChange(lang.code)}
                                className={`
                                    w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-100
                                    ${locale === lang.code ? 'bg-gray-50 text-indigo-600 font-semibold' : 'text-gray-700'}
                                `}
                                role="menuitem"
                            >
                                <lang.flag />
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
