import { jsPDF } from "jspdf";

export interface TicketData {
    ticketId: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    location: string;
    zone: string;
    seat?: string;
    attendeeName: string;
    qrPayload: string;
}

async function drawTicket(doc: jsPDF, ticket: TicketData) {
    const width = 80;
    const margin = 5;

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, 140, "F");

    // Header
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, width, 20, "F");

    // Event Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const eventName = ticket.eventName || "Evento";
    const titleLines = doc.splitTextToSize(eventName, width - 10);
    doc.text(titleLines, width / 2, 8, { align: "center" });

    // Date & Time
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${ticket.eventDate || ""} - ${ticket.eventTime || ""}`, width / 2, 16, { align: "center" });

    // Ticket Info
    let y = 30;
    doc.setTextColor(0, 0, 0);

    // Attendee
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("ASISTENTE:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(ticket.attendeeName || "Invitado", margin, y + 4);
    y += 10;

    // Zone
    doc.setFont("helvetica", "bold");
    doc.text("ZONA:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(ticket.zone || "General", margin, y + 4);

    // Seat (if exists)
    if (ticket.seat) {
        doc.setFont("helvetica", "bold");
        doc.text("ASIENTO:", width / 2 + margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(ticket.seat, width / 2 + margin, y + 4);
    }
    y += 10;

    // Location
    doc.setFont("helvetica", "bold");
    doc.text("UBICACIÓN:", margin, y);
    doc.setFont("helvetica", "normal");
    const location = ticket.location || "Ubicación por confirmar";
    const locLines = doc.splitTextToSize(location, width - 10);
    doc.text(locLines, margin, y + 4);
    y += 10 + (locLines.length * 3);

    // QR Code
    try {
        // Fetch QR Code image
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qrPayload || ticket.ticketId)}`;
        const response = await fetch(qrUrl);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        const qrSize = 40;
        const qrX = (width - qrSize) / 2;
        doc.addImage(`data:image/png;base64,${base64}`, "PNG", qrX, y, qrSize, qrSize);
        y += qrSize + 5;
    } catch (e) {
        console.error("Error fetching QR for PDF:", e);
        doc.text("[Error loading QR]", width / 2, y + 20, { align: "center" });
        y += 40;
    }

    // Ticket ID
    doc.setFontSize(8);
    doc.setFont("courier", "bold");
    doc.text(ticket.ticketId, width / 2, y, { align: "center" });

    // Footer
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text("Presenta este código al ingresar", width / 2, 135, { align: "center" });
}

export async function generateTicketPDFBuffer(ticket: TicketData): Promise<ArrayBuffer> {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 140]
    });

    await drawTicket(doc, ticket);
    return doc.output("arraybuffer");
}

export async function generateBatchTicketPDF(tickets: TicketData[]): Promise<ArrayBuffer> {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 140]
    });

    for (let i = 0; i < tickets.length; i++) {
        if (i > 0) doc.addPage([80, 140], "portrait");
        await drawTicket(doc, tickets[i]);
    }

    return doc.output("arraybuffer");
}
