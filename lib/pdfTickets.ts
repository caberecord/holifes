/**
 * PDF Ticket Generation Utilities
 * Generates printable tickets in PDF format (4 per page)
 */



interface TicketData {
    ticketId: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    location: string;
    zone?: string;
    seat?: string;
    attendeeName?: string;
}

/**
 * Generate a PDF with tickets (4 per page)
 * @param tickets - Array of ticket data
 * @param filename - Name for the downloaded PDF file
 */
export async function generateTicketsPDF(tickets: TicketData[], filename: string = 'tickets.pdf') {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter' // 215.9 x 279.4 mm (US Letter)
    });

    const pageWidth = 215.9;
    const pageHeight = 279.4;
    const margin = 10;

    // Each ticket dimensions (2 columns x 2 rows = 4 per page)
    const ticketWidth = (pageWidth - margin * 3) / 2;
    const ticketHeight = (pageHeight - margin * 3) / 2;

    tickets.forEach((ticket, index) => {
        // Calculate position for this ticket
        const col = index % 2; // 0 or 1
        const row = Math.floor((index % 4) / 2); // 0 or 1
        const x = margin + col * (ticketWidth + margin);
        const y = margin + row * (ticketHeight + margin);

        // Add new page every 4 tickets (except for the first)
        if (index > 0 && index % 4 === 0) {
            doc.addPage();
        }

        // Draw ticket border
        doc.setDrawColor(99, 102, 241); // Indigo
        doc.setLineWidth(0.5);
        doc.roundedRect(x, y, ticketWidth, ticketHeight, 3, 3);

        // Header background
        doc.setFillColor(99, 102, 241); // Indigo
        doc.roundedRect(x, y, ticketWidth, 25, 3, 3, 'F');

        // Event name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const eventNameLines = doc.splitTextToSize(ticket.eventName, ticketWidth - 10);
        doc.text(eventNameLines, x + ticketWidth / 2, y + 10, { align: 'center', maxWidth: ticketWidth - 10 });

        // Date and time
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`${ticket.eventDate} • ${ticket.eventTime}`, x + ticketWidth / 2, y + 20, { align: 'center' });

        // Ticket ID
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('courier', 'bold');
        doc.text(ticket.ticketId, x + ticketWidth / 2, y + 35, { align: 'center' });

        // QR Code placeholder (using QR code API)
        const qrSize = 35;
        const qrX = x + (ticketWidth - qrSize) / 2;
        const qrY = y + 42;

        try {
            // Add QR code image
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.ticketId)}`;
            doc.addImage(qrUrl, 'PNG', qrX, qrY, qrSize, qrSize);
        } catch (error) {
            console.error('Error adding QR code:', error);
        }

        // Attendee info (if provided)
        let currentY = y + qrY + qrSize + 5;

        if (ticket.attendeeName) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Asistente:', x + 5, currentY);
            doc.setFont('helvetica', 'normal');
            doc.text(ticket.attendeeName, x + 5, currentY + 4);
            currentY += 10;
        }

        // Zone and seat info
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        if (ticket.zone) {
            doc.text(`Zona: ${ticket.zone}`, x + 5, currentY);
            currentY += 4;
        }
        if (ticket.seat) {
            doc.text(`Asiento: ${ticket.seat}`, x + 5, currentY);
            currentY += 4;
        }

        // Location
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        const locationLines = doc.splitTextToSize(ticket.location, ticketWidth - 10);
        doc.text(locationLines, x + 5, ticketHeight + y - 8);
    });

    // Save the PDF
    doc.save(filename);
}

/**
 * Generate generic tickets based on venue capacity
 * @param count - Number of tickets to generate
 * @param eventData - Event information
 * @param eventId - Event ID for signature
 * @returns Array of generic ticket data
 */
export async function generateGenericTickets(
    count: number,
    eventData: {
        name: string;
        date: string;
        startTime: string;
        location: string;
        id: string;
    }
): Promise<TicketData[]> {
    const { generateSecureTicketId } = await import('./ticketSecurity');

    const tickets: TicketData[] = [];

    for (let i = 1; i <= count; i++) {
        const uniqueSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase();
        const baseTicketId = `TKT-${timestamp}-${uniqueSuffix}`;

        // Generate signed ticket ID (using generic email for signature)
        const secureTicketId = await generateSecureTicketId(
            baseTicketId,
            `generic-${i}@event.local`,
            eventData.id
        );

        tickets.push({
            ticketId: secureTicketId,
            eventName: eventData.name,
            eventDate: eventData.date,
            eventTime: eventData.startTime,
            location: eventData.location,
            zone: 'General',
            attendeeName: undefined // Generic ticket - no name
        });
    }

    return tickets;
}
