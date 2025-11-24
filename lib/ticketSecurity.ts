/**
 * Ticket Security Utilities
 * Provides HMAC-based digital signatures for ticket validation
 */

/**
 * Generate a secure HMAC signature for a ticket
 * @param ticketData - Object containing ticket information
 * @returns Promise<string> - Hex-encoded HMAC signature
 */
export async function generateTicketSignature(ticketData: {
    ticketId: string;
    email: string;
    eventId: string;
}): Promise<string> {
    try {
        const secretKey = process.env.NEXT_PUBLIC_TICKET_SECRET_KEY || 'default-secret-key-change-in-production';

        // Concatenate data to be signed
        // Note: We do NOT normalize here to allow verifying legacy non-normalized signatures.
        // Generators should normalize before calling this if desired.
        const dataToSign = `${ticketData.ticketId}|${ticketData.email}|${ticketData.eventId}`;

        // Convert secret key and data to Uint8Array
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secretKey);
        const messageData = encoder.encode(dataToSign);

        // Check if crypto.subtle is available
        if (!crypto || !crypto.subtle) {
            throw new Error('crypto.subtle no disponible en este contexto. Asegúrate de que la app esté en HTTPS.');
        }

        // Import key for HMAC
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        // Generate HMAC signature
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

        // Convert to hex string (take first 8 bytes for readability)
        const signatureArray = new Uint8Array(signature);
        const hexSignature = Array.from(signatureArray.slice(0, 8))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        return hexSignature.toUpperCase();
    } catch (error) {
        console.error('Error generating signature:', error);
        throw new Error(`Error al generar firma: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Verify a ticket signature
 * @param ticketData - Ticket data to verify
 * @param providedSignature - The signature to verify against
 * @returns Promise<boolean> - True if signature is valid
 */
export async function verifyTicketSignature(
    ticketData: {
        ticketId: string;
        email: string;
        eventId: string;
    },
    providedSignature: string
): Promise<boolean> {
    // 1. Try with normalized email (Preferred/New Standard)
    const normalizedEmail = ticketData.email.toLowerCase().trim();
    const signatureNormalized = await generateTicketSignature({
        ...ticketData,
        email: normalizedEmail
    });

    if (signatureNormalized === providedSignature.toUpperCase()) {
        return true;
    }

    // 2. Fallback: Try with raw email (Legacy compatibility)
    // This handles cases where old tickets were signed with uppercase/mixed emails
    if (ticketData.email !== normalizedEmail) {
        const signatureRaw = await generateTicketSignature(ticketData);
        if (signatureRaw === providedSignature.toUpperCase()) {
            return true;
        }
    }

    return false;
}

/**
 * Generate a complete secure ticket ID with signature
 * @param baseId - Base ticket ID (without signature)
 * @param email - Attendee email
 * @param eventId - Event ID
 * @returns Promise<string> - Complete ticket ID with signature
 */
export async function generateSecureTicketId(
    baseId: string,
    email: string,
    eventId: string
): Promise<string> {
    // Normalize email to ensure consistency
    const normalizedEmail = email.toLowerCase().trim();
    const signature = await generateTicketSignature({
        ticketId: baseId,
        email: normalizedEmail,
        eventId
    });

    return `${baseId}-${signature}`;
}

/**
 * Parse a secure ticket ID into its components
 * @param fullTicketId - Complete ticket ID with signature
 * @returns Object containing baseId and signature
 */
export function parseSecureTicketId(fullTicketId: string): {
    baseId: string;
    signature: string;
} {
    const parts = fullTicketId.split('-');
    if (parts.length < 4) {
        throw new Error('Invalid ticket ID format');
    }

    const signature = parts[parts.length - 1];
    const baseId = parts.slice(0, -1).join('-');

    return { baseId, signature };
}

/**
 * QR Payload Interface (v1.0)
 * JSON structure embedded in QR codes for enhanced security
 */
export interface QRPayload {
    tId: string;      // Ticket ID (without signature)
    eId: string;      // Event ID
    s: string;        // HMAC Signature
    v: string;        // Version (for future compatibility)
}

/**
 * Generate JSON payload for QR code (New secure format)
 * @param ticketId - Base ticket ID
 * @param eventId - Event ID
 * @param email - Attendee email
 * @returns Promise<string> - JSON string to embed in QR
 */
export async function generateQRPayload(
    ticketId: string,
    eventId: string,
    email: string
): Promise<string> {
    // Normalize email to ensure consistency
    const normalizedEmail = email.toLowerCase().trim();
    const signature = await generateTicketSignature({
        ticketId,
        email: normalizedEmail,
        eventId
    });

    const payload: QRPayload = {
        tId: ticketId,
        eId: eventId,
        s: signature,
        v: "1.0"
    };

    return JSON.stringify(payload);
}

/**
 * Parse QR payload with backward compatibility
 * @param qrContent - Raw QR string (JSON or legacy format)
 * @returns Parsed payload or null if invalid
 */
export function parseQRPayload(qrContent: string): QRPayload | { legacy: true; ticketId: string } | null {
    try {
        // Try parsing as JSON first (new format)
        const payload = JSON.parse(qrContent) as QRPayload;

        // Validate required fields
        if (payload.tId && payload.eId && payload.s && payload.v) {
            return payload;
        }

        return null;
    } catch {
        // Not JSON - assume legacy format (plain ticketId string)
        // Legacy format: "POS-ABC123-SIGNATURE" or similar
        if (qrContent && typeof qrContent === 'string' && qrContent.length > 0) {
            return { legacy: true, ticketId: qrContent };
        }

        return null;
    }
}

/**
 * Verify QR payload signature
 * @param payload - Parsed QR payload
 * @param email - Attendee email
 * @returns Promise<boolean> - True if valid
 */
export async function verifyQRPayload(
    payload: QRPayload,
    email: string
): Promise<boolean> {
    return verifyTicketSignature(
        {
            ticketId: payload.tId,
            email,
            eventId: payload.eId
        },
        payload.s
    );
}

