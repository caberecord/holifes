import { format, formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

const locales: Record<string, any> = {
    es: es,
    en: enUS,
};

export function formatDate(
    date: Date | number | string,
    localeCode: string = 'es',
    formatStr: string = 'PP p'
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = locales[localeCode] || es;

    try {
        return format(dateObj, formatStr, { locale });
    } catch (error) {
        console.error("Error formatting date:", error);
        return String(date);
    }
}

export function formatRelativeTime(
    date: Date | number | string,
    localeCode: string = 'es'
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = locales[localeCode] || es;

    try {
        return formatDistanceToNow(dateObj, { addSuffix: true, locale });
    } catch (error) {
        console.error("Error formatting relative time:", error);
        return String(date);
    }
}

export function formatCurrency(
    amount: number,
    currencyCode: string = 'USD',
    localeCode: string = 'es'
): string {
    try {
        return new Intl.NumberFormat(localeCode, {
            style: 'currency',
            currency: currencyCode,
        }).format(amount);
    } catch (error) {
        console.error("Error formatting currency:", error);
        return `${amount} ${currencyCode}`;
    }
}

export function formatZonedDate(
    date: Date | number | string,
    timeZone: string,
    localeCode: string = 'es',
    formatStr: string = 'PP p'
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = locales[localeCode] || es;

    try {
        const zonedDate = toZonedTime(dateObj, timeZone);
        return format(zonedDate, formatStr, { locale });
    } catch (error) {
        console.error("Error formatting zoned date:", error);
        return String(date);
    }
}
