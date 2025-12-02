import { describe, it, expect } from 'vitest';
import { isValidSubdomain, generateSubdomain, getSubdomainValidationError } from '@/lib/subdomain/validator';

describe('Subdomain Validator', () => {
    describe('isValidSubdomain', () => {
        it('should return true for valid subdomains', () => {
            expect(isValidSubdomain('my-event')).toBe(true);
            expect(isValidSubdomain('event2024')).toBe(true);
        });

        it('should return false for invalid characters', () => {
            expect(isValidSubdomain('My Event')).toBe(false);
            expect(isValidSubdomain('event!')).toBe(false);
        });

        it('should return false for reserved words', () => {
            expect(isValidSubdomain('admin')).toBe(false);
            expect(isValidSubdomain('login')).toBe(false);
        });

        it('should return false for length violations', () => {
            expect(isValidSubdomain('ab')).toBe(false); // Too short
            expect(isValidSubdomain('a'.repeat(64))).toBe(false); // Too long
        });
    });

    describe('generateSubdomain', () => {
        it('should generate valid subdomain from name', () => {
            expect(generateSubdomain('My Event 2024!')).toBe('myevent2024');
        });

        it('should handle accents', () => {
            expect(generateSubdomain('Éxito Total')).toBe('exitototal');
        });

        it('should handle reserved words by appending suffix', () => {
            expect(generateSubdomain('admin')).toBe('admin-event');
        });
    });

    describe('getSubdomainValidationError', () => {
        it('should return null for valid subdomain', () => {
            expect(getSubdomainValidationError('valid-subdomain')).toBe(null);
        });

        it('should return error message for invalid subdomain', () => {
            expect(getSubdomainValidationError('invalid space')).not.toBe(null);
        });
    });
});
