import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth/api-auth';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    const user = await verifyAuth(request);
    if (!user) {
        return unauthorizedResponse();
    }

    try {
        const body = await request.json();
        const { eventId, items, customer, payment, selectedSeats, totalAmount } = body;

        if (!eventId || !items || !customer || !payment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const saleId = await adminDb.runTransaction(async (transaction) => {
            const eventRef = adminDb.collection('events').doc(eventId);
            const eventDoc = await transaction.get(eventRef);

            if (!eventDoc.exists) {
                throw new Error('Event not found');
            }

            const eventData = eventDoc.data();
            if (!eventData) {
                throw new Error('Event data is empty');
            }
            const currentSoldSeats = eventData.soldSeats || [];

            console.log(`[Transaction] Processing for Event: ${eventId}`);
            console.log(`[Transaction] Current Sold Seats: ${currentSoldSeats.length}`);

            // 1. Validate Seat Availability
            const newSoldSeats: string[] = [];
            if (selectedSeats) {
                Object.entries(selectedSeats).forEach(([zoneName, seats]: [string, any]) => {
                    if (Array.isArray(seats)) {
                        seats.forEach((seatId: string) => {
                            const seatWithZone = `${zoneName}:${seatId}`;
                            // Check against current DB state
                            if (currentSoldSeats.includes(seatWithZone)) {
                                console.error(`[Transaction] Seat collision: ${seatWithZone}`);
                                throw new Error(`Seat ${seatId} in ${zoneName} is already sold`);
                            }
                            newSoldSeats.push(seatWithZone);
                        });
                    }
                });
            }
            console.log(`[Transaction] New Seats to Sell:`, newSoldSeats);

            // 1.5 Validate Prices & General Capacity (Security Hardening)
            let calculatedTotal = 0;
            const zones = eventData.venue?.zones || [];
            const currentStats = eventData.stats || {};
            const soldByZone = currentStats.soldByZone || {};

            for (const [zoneName, qty] of Object.entries(items)) {
                const quantity = Number(qty);
                if (quantity <= 0) continue;

                const zone = zones.find((z: any) => z.name === zoneName);
                if (!zone) {
                    throw new Error(`Zone '${zoneName}' not found in event configuration`);
                }

                // Price Validation
                calculatedTotal += (zone.price || 0) * quantity;

                // Capacity Validation for General Zones
                // (Numbered zones are implicitly checked by seat availability above)
                if (zone.type === 'standing' || zone.type === 'general') {
                    const currentSold = soldByZone[zoneName] || 0;
                    if (currentSold + quantity > zone.capacity) {
                        throw new Error(`Capacity exceeded for zone '${zoneName}'. Available: ${zone.capacity - currentSold}`);
                    }
                }
            }

            // Verify Total Amount (Optional: strict check or just overwrite)
            // We overwrite to ensure integrity
            if (Math.abs(calculatedTotal - totalAmount) > 1) {
                console.warn(`[Transaction] Price mismatch. Client: ${totalAmount}, Server: ${calculatedTotal}`);
                // throw new Error('Price mismatch detected'); // Uncomment to be strict
            }
            const finalAmount = calculatedTotal;

            // 2. Create Sale Document
            const saleRef = adminDb.collection('sales').doc();
            const saleData = {
                eventId,
                items, // Cart items
                customer,
                payment,
                selectedSeats: selectedSeats || {},
                totalAmount: finalAmount,
                status: 'completed',
                createdAt: FieldValue.serverTimestamp(),
                createdBy: user.uid,
                organizerId: eventData?.organizerId || user.uid,
            };

            transaction.set(saleRef, saleData);

            // 3. Write Attendees to Subcollection
            if (body.attendees && Array.isArray(body.attendees)) {
                body.attendees.forEach((attendee: any) => {
                    const attendeeRef = adminDb.collection('events').doc(eventId).collection('attendees').doc(attendee.ticketId);
                    transaction.set(attendeeRef, {
                        ...attendee,
                        organizerId: eventData?.organizerId || user.uid,
                        createdAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                        saleId: saleRef.id
                    });
                });
            }

            // 4. Update Event (Sold Seats & Stats)
            const totalTickets = Object.values(items).reduce((acc: number, qty: any) => acc + Number(qty), 0);

            const updateData: any = {
                soldSeats: FieldValue.arrayUnion(...newSoldSeats),
                'stats.soldTickets': FieldValue.increment(totalTickets),
                'stats.totalSold': FieldValue.increment(totalTickets), // Legacy support
                'stats.revenue': FieldValue.increment(totalAmount)
            };

            // Update soldByZone
            Object.entries(items).forEach(([zoneName, qty]) => {
                updateData[`stats.soldByZone.${zoneName}`] = FieldValue.increment(Number(qty));
            });

            transaction.update(eventRef, updateData);

            return saleRef.id;
        });

        return NextResponse.json({ success: true, saleId });

    } catch (error: any) {
        console.error('Transaction failed:', error);
        return NextResponse.json(
            { error: error.message || 'Transaction failed' },
            { status: 500 }
        );
    }
}
