import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host") || "";

    // Define allowed domains (including localhost)
    const allowedDomains = ["holifes.com", "www.holifes.com", "localhost:3000"];

    // Check if the hostname is a subdomain
    const isSubdomain = !allowedDomains.includes(hostname);

    // If it's a subdomain, rewrite the request to the sites dynamic route
    if (isSubdomain) {
        const subdomain = hostname.split(".")[0];
        // Rewrite to /sites/[subdomain]
        // We keep the path (e.g. /about) and query params
        return NextResponse.rewrite(new URL(`/sites/${subdomain}${url.pathname}`, req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - dashboard (dashboard routes - though usually dashboard is on main domain)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
