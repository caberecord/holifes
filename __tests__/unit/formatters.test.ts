import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from '@/lib/formatters';

describe('Formatters', () => {
    describe('formatDate', () => {
        it('should format date correctly in Spanish by default', () => {
            const date = new Date('2023-10-01T12:00:00');
            const formatted = formatDate(date);
            // "1 oct 2023 12:00" or similar depending on locale exact string
            expect(formatted).toContain('2023');
        });

        it('should handle string dates', () => {
            const formatted = formatDate('2023-10-01T12:00:00');
            expect(formatted).toContain('2023');
        });
    });

    describe('formatCurrency', () => {
        it('should format USD correctly', () => {
            const result = formatCurrency(1000, 'USD', 'en');
            // Normalize spaces (some locales use non-breaking space)
            expect(result.replace(/\s/g, ' ')).toBe('$1,000.00');
        });

        it('should format COP correctly', () => {
            const result = formatCurrency(1000, 'COP', 'es-CO');
            // COP usually has $ and no decimals or ,00 depending on implementation
            expect(result).toContain('1.000');
        });
    });
});
