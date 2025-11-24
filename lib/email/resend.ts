// Resend email configuration

import { Resend } from 'resend';

// Lazy initialization - get instance when needed
export function getResendClient() {
    // Try both regular and public env vars (NEXT_PUBLIC_ works in both server and client)
    const apiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;

    // Debug logging
    console.log('🔍 Environment check:');
    console.log('  - Server API Key exists:', !!process.env.RESEND_API_KEY);
    console.log('  - Public API Key exists:', !!process.env.NEXT_PUBLIC_RESEND_API_KEY);
    console.log('  - Using API Key exists:', !!apiKey);
    console.log('  - API Key length:', apiKey?.length || 0);
    console.log('  - First 10 chars:', apiKey?.substring(0, 10) || 'undefined');

    if (!apiKey) {
        console.error('❌ No RESEND API KEY found!');
        console.error('Available RESEND vars:', Object.keys(process.env).filter(k => k.includes('RESEND')));
        throw new Error('RESEND_API_KEY is not defined in environment variables');
    }

    console.log('✅ Creating Resend client...');
    return new Resend(apiKey);
}

// Default from email
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// App URL for links in emails
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
