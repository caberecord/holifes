import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import { logTransaction } from "@/lib/transactions";

// Alegra Webhook Structure (Example)
// {
//   "event": "invoice.status_changed",
//   "data": {
//     "id": "123",
//     "status": "open",
//     ...
//   }
// }

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event, data } = body;

        // console.log("Alegra Webhook Received:", event, data?.id);

        // Security Check: In a real app, verify signature from headers
        // const signature = req.headers.get('x-alegra-signature');
        // if (!verifySignature(signature, body)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

        if (!event || !data) {
            return NextResponse.json({ message: "Ignored: Missing event or data" });
        }

        // Handle specific events
        if (event === 'invoice.status_changed' || event === 'invoice.created') {
            await handleInvoiceUpdate(data);
        }

        // Log the webhook event for debugging/audit
        await addDoc(collection(db, "webhook_logs"), {
            provider: 'alegra',
            event,
            payload: data,
            receivedAt: serverTimestamp()
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error processing Alegra webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

async function handleInvoiceUpdate(invoiceData: any) {
    // Find the transaction associated with this invoice
    // We stored 'alegraId' in the transactions collection

    try {
        const q = query(
            collection(db, "transactions"),
            where("alegraId", "==", String(invoiceData.id)),
            where("type", "==", "INVOICE_EMISSION")
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            const transactionData = docSnap.data();

            // Update transaction status if needed
            // Map Alegra status to our status
            let newStatus = transactionData.status;
            if (invoiceData.status === 'open' || invoiceData.status === 'paid') {
                newStatus = 'SUCCESS';
            } else if (invoiceData.status === 'voided') {
                newStatus = 'FAILED'; // Or REFUNDED/VOIDED
            }

            if (newStatus !== transactionData.status) {
                await updateDoc(docSnap.ref, {
                    status: newStatus,
                    "metadata.latestAlegraStatus": invoiceData.status,
                    updatedAt: serverTimestamp()
                });

                // console.log(`Updated transaction ${docSnap.id} status to ${newStatus}`);
            }
        } else {
            // console.log(`No matching transaction found for Alegra Invoice ID: ${invoiceData.id}`);
        }
    } catch (error) {
        console.error("Error updating transaction from webhook:", error);
    }
}
