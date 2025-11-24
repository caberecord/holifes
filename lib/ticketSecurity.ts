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
    const secretKey = process.env.NEXT_PUBLIC_TICKET_SECRET_KEY || 'default-secret-key-change-in-production';

    // Concatenate data to be signed
    const dataToSign = `${ticketData.ticketId}|${ticketData.email}|${ticketData.eventId}`;

    // Convert secret key and data to Uint8Array
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(dataToSign);

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
    const expectedSignature = await generateTicketSignature(ticketData);
    return expectedSignature === providedSignature.toUpperCase();
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
    const signature = await generateTicketSignature({
        ticketId: baseId,
        email,
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
