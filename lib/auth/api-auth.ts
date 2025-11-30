
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        uid: string;
        email?: string;
        role?: string;
    };
}

/**
 * Verify Firebase ID Token from Authorization header
 * @param request NextRequest
 * @returns Decoded ID Token or null if invalid
 */
export async function verifyAuth(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return null;
    }
}

/**
 * Standard unauthorized response
 */
export function unauthorizedResponse() {
    return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
    );
}
