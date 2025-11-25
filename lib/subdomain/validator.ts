/**
 * Utilidades para validación y generación de subdominios
 */

// Palabras reservadas que no pueden usarse como subdominios
const RESERVED_SUBDOMAINS = [
    'www',
    'api',
    'admin',
    'dashboard',
    'login',
    'register',
    'app',
    'mail',
    'email',
    'smtp',
    'ftp',
    'cdn',
    'static',
    'assets',
    'blog',
    'docs',
    'support',
    'help',
    'status',
    'beta',
    'staging',
    'dev',
    'test',
    'demo',
];

/**
 * Valida si un subdominio es válido según las reglas:
 * - Solo minúsculas, números y guiones
 * - No puede empezar o terminar con guión
 * - Longitud: 3-63 caracteres
 * - No puede ser una palabra reservada
 * 
 * @param subdomain El subdominio a validar
 * @returns true si es válido, false si no
 */
export function isValidSubdomain(subdomain: string): boolean {
    // Verificar longitud
    if (subdomain.length < 3 || subdomain.length > 63) {
        return false;
    }

    // Verificar formato: solo minúsculas, números y guiones
    const subdomainRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!subdomainRegex.test(subdomain)) {
        return false;
    }

    // Verificar que no sea una palabra reservada
    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
        return false;
    }

    return true;
}

/**
 * Genera un subdominio a partir de un nombre de evento
 * Convierte a minúsculas, reemplaza espacios y caracteres especiales
 * 
 * @param eventName El nombre del evento
 * @returns Un subdominio válido sugerido
 */
export function generateSubdomain(eventName: string): string {
    let subdomain = eventName
        .toLowerCase()
        .trim()
        // Remover acentos y caracteres especiales
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Remover cualquier caracter que no sea letra o número (elimina espacios, guiones, etc.)
        .replace(/[^a-z0-9]/g, '');

    // Si el resultado es muy corto, agregar sufijo
    if (subdomain.length < 3) {
        subdomain = `evento-${subdomain}`;
    }

    // Truncar si es muy largo
    if (subdomain.length > 63) {
        subdomain = subdomain.substring(0, 63).replace(/-+$/, '');
    }

    // Si es una palabra reservada, agregar sufijo
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
        subdomain = `${subdomain}-event`;
    }

    return subdomain;
}

/**
 * Genera un subdominio único agregando un sufijo numérico si ya existe
 * 
 * @param baseSubdomain El subdominio base
 * @param checkExistence Función async para verificar si el subdominio existe
 * @returns Un subdominio único
 */
export async function generateUniqueSubdomain(
    baseSubdomain: string,
    checkExistence: (subdomain: string) => Promise<boolean>
): Promise<string> {
    let subdomain = baseSubdomain;

    // Si el subdominio base ya existe, agregar un sufijo aleatorio corto
    // Intentamos hasta 5 veces con diferentes sufijos
    let attempts = 0;
    while (await checkExistence(subdomain)) {
        // Generar sufijo aleatorio de 4 caracteres (ej. 73n3)
        const suffix = Math.random().toString(36).substring(2, 6);
        // Concatenar directamente sin guión
        subdomain = `${baseSubdomain}${suffix}`;

        attempts++;
        if (attempts > 5) {
            // Si falla 5 veces, usar timestamp para garantizar unicidad
            subdomain = `${baseSubdomain}${Date.now()}`;
            break;
        }
    }

    return subdomain;
}

/**
 * Obtiene mensajes de error de validación para mostrar al usuario
 * 
 * @param subdomain El subdominio a validar
 * @returns Mensaje de error o null si es válido
 */
export function getSubdomainValidationError(subdomain: string): string | null {
    if (!subdomain) {
        return 'El subdominio es requerido';
    }

    if (subdomain.length < 3) {
        return 'El subdominio debe tener al menos 3 caracteres';
    }

    if (subdomain.length > 63) {
        return 'El subdominio no puede tener más de 63 caracteres';
    }

    if (!/^[a-z0-9-]+$/.test(subdomain)) {
        return 'El subdominio solo puede contener letras minúsculas, números y guiones';
    }

    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
        return 'El subdominio no puede empezar ni terminar con un guión';
    }

    if (/--/.test(subdomain)) {
        return 'El subdominio no puede contener guiones consecutivos';
    }

    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
        return 'Este subdominio está reservado. Por favor elige otro';
    }

    return null;
}
