import { NextRequest, NextResponse } from 'next/server';
import { getResendClient, FROM_EMAIL, APP_URL } from '@/lib/email/resend';
import { generateTicketPDFBuffer } from '@/lib/email/generateTicketPDF';
import { generateICS, generateEventJSONLD } from '@/lib/email/calendar';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tickets, email, eventName } = body;

        if (!tickets || !Array.isArray(tickets) || tickets.length === 0 || !email) {
            return NextResponse.json(
                { error: 'Missing required fields (tickets array, email)' },
                { status: 400 }
            );
        }

        console.log(`Processing batch email for ${email} with ${tickets.length} tickets`);

        // Extract event details from the first ticket for Calendar
        const firstTicket = tickets[0];
        // Parse date: "DD/MM/YYYY" -> "YYYY-MM-DD" for the helper
        // Assuming input is DD/MM/YYYY from POSModule
        const [day, month, year] = firstTicket.eventDate.split('/');
        const isoDate = `${year}-${month}-${day}`;

        const eventData = {
            eventName: eventName,
            location: firstTicket.eventLocation,
            startDate: isoDate,
            startTime: firstTicket.eventTime, // Assuming HH:mm
            description: `Entradas para ${eventName}`
        };

        // 1. Generate Calendar Assets
        const icsContent = generateICS(eventData);
        const jsonLd = generateEventJSONLD(eventData);

        // 2. Generate PDF Attachments
        const attachments: any[] = await Promise.all(tickets.map(async (ticket: any) => {
            try {
                const pdfBuffer = await generateTicketPDFBuffer({
                    ticketId: ticket.ticketId,
                    eventName: ticket.eventName,
                    eventDate: ticket.eventDate,
                    eventTime: ticket.eventTime,
                    location: ticket.eventLocation,
                    zone: ticket.zone,
                    seat: ticket.seat,
                    attendeeName: ticket.attendeeName,
                    qrPayload: ticket.qrPayload
                });

                return {
                    filename: `Ticket-${ticket.ticketId}.pdf`,
                    content: Buffer.from(pdfBuffer)
                };
            } catch (err) {
                console.error(`Failed to generate PDF for ticket ${ticket.ticketId}:`, err);
                return null;
            }
        }));

        // Add ICS Attachment
        attachments.push({
            filename: 'invite.ics',
            content: Buffer.from(icsContent),
            contentType: 'text/calendar'
        });

        // Filter out failed PDFs
        const validAttachments = attachments.filter(a => a !== null);

        // 3. Build Consolidated HTML
        const ticketsHtml = tickets.map((ticket: any) => {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qrPayload || ticket.ticketId)}`;
            return `
            <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 30px; margin-bottom: 30px; background: #ffffff; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h3 style="margin: 0 0 10px 0; color: #4f46e5; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px;">${ticket.eventName}</h3>
                
                <div style="margin: 20px auto;">
                    <img src="${qrUrl}" alt="QR Code" style="width: 250px; height: 250px; border: 8px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 12px;" />
                </div>

                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; display: inline-block; width: 100%; max-width: 300px; text-align: left; margin: 0 auto;">
                    <p style="margin: 5px 0; font-size: 14px; color: #374151;"><strong>👤 Asistente:</strong> ${ticket.attendeeName}</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #374151;"><strong>📍 Zona:</strong> ${ticket.zone} ${ticket.seat ? `• Asiento: ${ticket.seat}` : ''}</p>
                    <p style="margin: 5px 0; font-size: 12px; color: #6b7280; font-family: monospace;">ID: ${ticket.ticketId}</p>
                </div>
            </div>
            `;
        }).join('');

        const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script type="application/ld+json">
              ${jsonLd}
            </script>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
              .wrapper { width: 100%; background-color: #f3f4f6; padding: 40px 0; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; color: white; }
              .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
              .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
              .content { padding: 40px 20px; }
              .footer { text-align: center; font-size: 12px; color: #9ca3af; padding: 20px; background: #f9fafb; border-top: 1px solid #f3f4f6; }
              .btn { display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3); transition: transform 0.2s; }
              .btn:hover { transform: translateY(-2px); }
              @media only screen and (max-width: 600px) {
                .container { width: 100% !important; border-radius: 0 !important; }
                .content { padding: 20px !important; }
              }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="container">
                <div class="header">
                  <h1>¡Tus Entradas Están Listas!</h1>
                  <p>Gracias por tu compra. Aquí tienes tus tickets.</p>
                </div>
                
                <div class="content">
                  ${ticketsHtml}
                  
                  <div style="text-align: center; margin-top: 40px;">
                    <a href="${APP_URL}" class="btn">Ver en la App</a>
                  </div>
                  
                  <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #6b7280;">
                    Hemos adjuntado tus tickets en PDF y una invitación al calendario.
                  </p>
                </div>

                <div class="footer">
                  <p>Enviado a través de Holifes</p>
                  <p style="margin-top: 5px;">No compartas estos códigos QR con nadie más.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
        `;

        // 4. Send Email via Resend
        const resend = getResendClient();
        const senderEmail = process.env.RESEND_FROM_EMAIL || FROM_EMAIL;

        const { data, error } = await resend.emails.send({
            from: senderEmail,
            to: email,
            subject: `🎟️ Tus entradas para ${eventName}`,
            html: htmlContent,
            attachments: validAttachments
        });

        if (error) {
            console.error('❌ Resend Batch API Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`Batch email sent to ${email}`);
        return NextResponse.json({ success: true, count: tickets.length });

    } catch (error: any) {
        console.error('Error in batch ticket route:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send batch tickets' },
            { status: 500 }
        );
    }
}
