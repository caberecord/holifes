import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, addDoc, increment, serverTimestamp } from "firebase/firestore";
import { processSaleTransaction } from "@/lib/sales/processSaleTransaction";
import { generateSecureTicketId, generateQRPayload } from "@/lib/ticketSecurity";
import { logTransaction } from "@/lib/transactions";
import { toast } from "react-toastify";
import { POSAttendee } from "@/types/pos";
import { Event } from "@/types/event";

export const posService = {
    async saveOrUpdateContact(buyer: POSAttendee, totalAmount: number, totalItems: number, organizerId: string) {
        try {
            let q;
            if (buyer.idNumber) {
                q = query(collection(db, "contacts"), where("organizerId", "==", organizerId), where("identification.number", "==", buyer.idNumber));
            } else {
                q = query(collection(db, "contacts"), where("organizerId", "==", organizerId), where("email", "==", buyer.email));
            }
            const snapshot = await getDocs(q);
            let contactId;

            if (!snapshot.empty) {
                const docRef = snapshot.docs[0].ref;
                contactId = docRef.id;
                await updateDoc(docRef, {
                    totalSpent: increment(totalAmount),
                    totalTickets: increment(totalItems),
                    lastInteraction: serverTimestamp(),
                });
            } else {
                const newContact = {
                    organizerId,
                    name: buyer.name,
                    email: buyer.email,
                    phone: buyer.phone || "",
                    identification: { type: buyer.idType || 'CC', number: buyer.idNumber || "" },
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    lastInteraction: serverTimestamp(),
                    totalSpent: totalAmount,
                    totalTickets: totalItems,
                    source: 'POS'
                };
                const docRef = await addDoc(collection(db, "contacts"), newContact);
                contactId = docRef.id;
            }
            return contactId;
        } catch (error) {
            console.error("Error saving contact:", error);
            return null;
        }
    },

    async processSale(
        selectedEvent: Event,
        cart: { [key: string]: number },
        mainAttendee: POSAttendee,
        paymentMethod: string,
        totalAmount: number,
        user: any
    ) {
        // 1. Save Contact
        const totalItems = Object.values(cart).reduce((a: number, b: number) => a + b, 0);
        const contactId = await this.saveOrUpdateContact(mainAttendee, totalAmount, totalItems, user.uid);

        // 2. Process Attendees & Update Event (Per Zone)
        const allProcessedAttendees: any[] = [];

        for (const [zoneName, qty] of Object.entries(cart)) {
            if (qty <= 0) continue;

            // Generate attendees for this zone
            const zoneAttendees = await Promise.all(Array(qty).fill(null).map(async (_, index) => {
                const uniqueSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
                const timestamp = Date.now().toString(36).toUpperCase();
                const baseTicketId = `POS-${timestamp}-${uniqueSuffix}`;
                const secureTicketId = await generateSecureTicketId(baseTicketId, mainAttendee.email, selectedEvent.id!);
                const qrPayload = await generateQRPayload(baseTicketId, selectedEvent.id!, mainAttendee.email);

                return {
                    id: Date.now() + index + Math.random(),
                    Name: mainAttendee.name,
                    Email: mainAttendee.email,
                    Phone: mainAttendee.phone,
                    IdNumber: mainAttendee.idNumber,
                    Zone: zoneName,
                    Seat: "",
                    Status: 'Confirmado',
                    ticketId: secureTicketId,
                    qrPayload,
                    paymentMethod,
                    soldBy: user.email,
                    purchaseDate: new Date().toISOString()
                };
            }));

            // Update Event in Firebase (Transaction)
            const zone = selectedEvent.venue?.zones.find((z: any) => z.name === zoneName);
            const zoneTotal = (zone?.price || 0) * qty;
            await processSaleTransaction(selectedEvent.id!, zoneName, zoneAttendees, zoneTotal);
            allProcessedAttendees.push(...zoneAttendees);
        }

        // 3. Send Emails (Batch)
        try {
            let token = '';
            if (user && typeof user.getIdToken === 'function') {
                token = await user.getIdToken();
            }
            await this.sendBatchEmail(mainAttendee.email, selectedEvent, allProcessedAttendees, token);
        } catch (err) {
            console.error("❌ Failed to send batch ticket email:", err);
            toast.error("Error al enviar correos, intente reenviar desde la pantalla de éxito");
        }

        // 4. Log Transaction
        await logTransaction({
            organizerId: user.uid,
            eventId: selectedEvent.id!,
            orderId: `POS-${Date.now()}`,
            userId: user.uid || 'unknown',
            contactId: contactId || undefined,
            type: 'SALE',
            status: 'SUCCESS',
            amount: totalAmount,
            currency: 'COP',
            metadata: {
                description: `Venta POS - ${selectedEvent.name}`,
                buyer: mainAttendee.name || mainAttendee.email,
                paymentMethod: paymentMethod || 'Unknown',
                items: cart
            }
        });

        return { contactId, allProcessedAttendees };
    },

    async sendBatchEmail(email: string, event: Event, attendees: any[], token?: string) {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const emailResponse = await fetch('/api/send-ticket/batch', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email,
                eventName: event.name,
                tickets: attendees.map(attendee => {
                    let formattedDate = "Fecha por confirmar";
                    try {
                        if (event.date) {
                            const d = new Date(event.date);
                            if (!isNaN(d.getTime())) {
                                const day = String(d.getDate()).padStart(2, '0');
                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                const year = d.getFullYear();
                                formattedDate = `${day}/${month}/${year}`;
                            }
                        }
                    } catch (e) { }

                    return {
                        ticketId: attendee.ticketId,
                        eventName: event.name,
                        eventDate: formattedDate,
                        eventTime: event.startTime || event.endTime || "N/A",
                        eventLocation: event.location,
                        zone: attendee.Zone,
                        seat: attendee.Seat,
                        attendeeName: attendee.Name,
                        qrPayload: attendee.qrPayload
                    };
                })
            })
        });

        if (!emailResponse.ok) {
            const error = await emailResponse.json();
            throw new Error(error.error || "Failed to send email");
        }
        return emailResponse.json();
    }
};
