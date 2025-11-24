// API route to send staff credentials email

import { NextRequest, NextResponse } from 'next/server';
import { sendStaffCredentials } from '../../../lib/email/sendStaffCredentials';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Event } from '../../../types/event';

export async function POST(request: NextRequest) {
    try {
        const { email, password, eventIds } = await request.json();

        // Validate input
        if (!email || !password || !eventIds || !Array.isArray(eventIds)) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Fetch assigned events
        const eventsQuery = query(
            collection(db, 'events'),
            where('__name__', 'in', eventIds)
        );
        const querySnapshot = await getDocs(eventsQuery);
        const assignedEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
            assignedEvents.push({ id: doc.id, ...doc.data() } as Event);
        });

        // Send email
        await sendStaffCredentials({
            email,
            password,
            assignedEvents,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error sending staff email:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send email' },
            { status: 500 }
        );
    }
}
