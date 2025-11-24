// API route to resend staff credentials

import { NextRequest, NextResponse } from 'next/server';
import { sendStaffCredentials } from '../../../lib/email/sendStaffCredentials';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Event } from '../../../types/event';
import { AppUser } from '../../../types/user';

export async function POST(request: NextRequest) {
    try {
        const { staffUid } = await request.json();

        if (!staffUid) {
            return NextResponse.json(
                { error: 'Missing staffUid' },
                { status: 400 }
            );
        }

        // Get staff user data
        const userDoc = await getDoc(doc(db, 'users', staffUid));
        if (!userDoc.exists()) {
            return NextResponse.json(
                { error: 'Staff user not found' },
                { status: 404 }
            );
        }

        const staffUser = userDoc.data() as AppUser;

        // Fetch assigned events
        const eventIds = staffUser.assignedEvents || [];
        if (eventIds.length === 0) {
            return NextResponse.json(
                { error: 'Staff has no assigned events' },
                { status: 400 }
            );
        }

        const eventsQuery = query(
            collection(db, 'events'),
            where('__name__', 'in', eventIds)
        );
        const querySnapshot = await getDocs(eventsQuery);
        const assignedEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
            assignedEvents.push({ id: doc.id, ...doc.data() } as Event);
        });

        // Note: We can't send the password again as it's hashed in Firebase Auth
        // This will send a reminder email without password
        await sendStaffCredentials({
            email: staffUser.email,
            password: '[Usa tu contraseña actual o contacta al organizador]',
            assignedEvents,
        });

        return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } catch (error: any) {
        console.error('Error resending staff email:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to resend email' },
            { status: 500 }
        );
    }
}
