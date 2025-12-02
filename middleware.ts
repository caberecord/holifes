import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'es', 'pt'],
    defaultLocale: 'es',
    localePrefix: 'always' // Forces /es or /en prefix
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - sites (internal routing)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sites|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const { pathname } = url;
    const hostname = req.headers.get('host') || '';

    // === 1. DETERMINAR ENTORNO ===
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
    const isVercelPreview = hostname.includes('.vercel.app') && !hostname.endsWith('holifes.vercel.app');
    const isProduction = hostname.includes('holifes.com');

    // === 2. EXCLUIR RUTAS ESPECIALES ===
    // API y _next ya están excluidos por el matcher, pero verificamos por seguridad si la lógica cambia
    if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
        return NextResponse.next();
    }

    // === 3. EXTRAER SUBDOMINIO ===
    let subdomain: string | null = null;

    if (isLocalhost) {
        const parts = hostname.split('.');
        if (parts.length >= 2 && parts[0] !== 'www') {
            subdomain = parts[0].split(':')[0];
        }
    } else if (isVercelPreview) {
        const parts = hostname.split('.');
        if (parts[0]) {
            subdomain = parts[0].split('-git-')[0];
        }
    } else if (isProduction) {
        const parts = hostname.split('.');
        if (parts.length <= 2 || parts[0] === 'www' || hostname === 'holifes.com') {
            subdomain = null;
        } else {
            subdomain = parts[0];
        }
    }

    // === 4. LOGICA DE ENRUTAMIENTO ===

    // CASO A: Es un Subdominio (Sitio Público)
    if (subdomain && subdomain !== 'www' && subdomain !== 'holifes') {
        // Validar formato
        const subdomainRegex = /^[a-z0-9-]+$/;
        if (!subdomainRegex.test(subdomain)) {
            // console.log(`[Middleware] Invalid subdomain format: ${subdomain}`);
            // return NextResponse.next(); 
        }

        // Reescribir a /sites/[subdomain]
        // Nota: Por ahora NO aplicamos i18n automático a los sitios generados para evitar conflictos de ruta
        // Si se requiere i18n en sitios, se deberá manejar dentro de /sites/[subdomain]
        const rewritePath = `/sites/${subdomain}${pathname}`;
        // console.log(`[Middleware] Rewriting Subdomain: ${hostname}${pathname} → ${rewritePath}`);
        return NextResponse.rewrite(new URL(rewritePath, req.url));
    }

    // CASO B: Es la App Principal (Dashboard, Login, Landing)
    // Aplicamos next-intl middleware para manejo de idiomas
    return intlMiddleware(req);
}
