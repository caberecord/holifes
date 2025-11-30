import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware para enrutamiento multi-tenant basado en subdominios
 * 
 * Flujo:
 * 1. Detecta el subdominio de la solicitud
 * 2. Diferencia entre entornos (localhost, preview, producción)
 * 3. Reescribe la URL internamente a /sites/[subdomain]
 * 4. Permite que app/dashboard y otras rutas funcionen normalmente
 */

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const { pathname } = url;

    // Obtener el hostname completo
    const hostname = req.headers.get('host') || '';

    // === 1. DETERMINAR ENTORNO ===

    // Localhost (desarrollo)
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    // Vercel preview deployments  
    const isVercelPreview = hostname.includes('.vercel.app') && !hostname.endsWith('holifes.vercel.app');

    // Producción
    const isProduction = hostname.includes('holifes.com');


    // === 2. EXCLUIR RUTAS ESPECIALES ===

    // No procesar rutas del dashboard, autenticación, API
    const specialPaths = [
        '/dashboard',
        '/login',
        '/register',
        '/api',
        '/_next',
        '/admin',
        '/checkin',
    ];

    if (specialPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }


    // === 3. EXTRAER SUBDOMINIO ===

    let subdomain: string | null = null;

    if (isLocalhost) {
        // En localhost, el subdominio es el primer segmento antes de "localhost"
        // Ejemplo: test.localhost:3000 → subdomain = "test"
        const parts = hostname.split('.');
        if (parts.length >= 2 && parts[0] !== 'www') {
            subdomain = parts[0].split(':')[0]; // Remover puerto si existe
        }
    } else if (isVercelPreview) {
        // Vercel preview: subdomain-git-branch.vercel.app
        // Ejemplo: mi-evento-git-main.vercel.app → subdomain = "mi-evento"
        const parts = hostname.split('.');
        if (parts[0]) {
            const cleanSubdomain = parts[0].split('-git-')[0];
            subdomain = cleanSubdomain;
        }
    } else if (isProduction) {
        // Producción: subdominio.holifes.com
        // Ejemplo: concierto2025.holifes.com → subdomain = "concierto2025"
        const parts = hostname.split('.');

        // Si es el dominio raíz (holifes.com o www.holifes.com), no hay subdominio
        if (parts.length <= 2 || parts[0] === 'www' || hostname === 'holifes.com') {
            subdomain = null;
        } else {
            subdomain = parts[0];
        }
    }


    // === 4. SI NO HAY SUBDOMINIO, CONTINUAR NORMAL ===

    if (!subdomain || subdomain === 'www' || subdomain === 'holifes') {
        // Esta es la aplicación principal (holifes.com)
        return NextResponse.next();
    }


    // === 5. VALIDAR FORMATO DEL SUBDOMINIO ===

    // Solo permitir caracteres alfanuméricos y guiones
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
        // Subdominio inválido, pero en lugar de redirigir al home (que parece login),
        // dejamos que pase. Si no existe, dará 404 en la página.
        console.log(`[Middleware] Invalid subdomain format: ${subdomain}`);
        // return NextResponse.redirect(new URL('/', req.url)); 
    }


    // === 6. VERIFICAR SI EL SUBDOMINIO EXISTE (con caché Redis) ===

    // TODO: Implementar validación contra Redis/DB
    // import { getSubdomainFromCache } from './lib/cache/redis';
    // const exists = await getSubdomainFromCache(subdomain);
    // if (!exists) return NextResponse.redirect(new URL('/404', req.url));


    // === 7. REESCRIBIR LA URL INTERNAMENTE ===

    // Reescribir /about → /sites/[subdomain]/about
    // Esto permite que app/sites/[subdomain]/page.tsx maneje la solicitud
    const rewritePath = `/sites/${subdomain}${pathname}`;

    console.log(`[Middleware] Rewriting: ${hostname}${pathname} → ${rewritePath}`);

    return NextResponse.rewrite(new URL(rewritePath, req.url));
}
