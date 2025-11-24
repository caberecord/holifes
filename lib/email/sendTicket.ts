// Email sending function for event tickets

import { getResendClient, FROM_EMAIL, APP_URL } from './resend';

interface SendTicketParams {
  email: string;
  attendeeName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketId: string;
  eventId?: string; // Optional for future use
  qrPayload?: string; // New: JSON QR payload
  zone: string;
  seat?: string;
}

export async function sendTicketEmail({
  email,
  attendeeName,
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  ticketId,
  eventId,
  qrPayload,
  zone,
  seat,
}: SendTicketParams): Promise<void> {
  try {
    // Use QR JSON payload if available, otherwise fallback to ticketId (legacy)
    const qrData = qrPayload || ticketId;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f3f4f6;
            }
            .container {
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
            }
            .event-title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .event-date {
              font-size: 16px;
              opacity: 0.9;
              margin-top: 10px;
            }
            .content {
              padding: 30px 20px;
              text-align: center;
            }
            .ticket-card {
              border: 2px dashed #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
              background: #fafafa;
            }
            .qr-code {
              width: 200px;
              height: 200px;
              margin: 20px auto;
              border: 8px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .ticket-info {
              text-align: left;
              margin-top: 20px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .label {
              color: #6b7280;
              font-size: 12px;
              text-transform: uppercase;
              font-weight: bold;
            }
            .value {
              color: #111827;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 12px;
            }
            .button {
              display: inline-block;
              background: #4f46e5;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="event-title">${eventName}</div>
              <div class="event-date">📅 ${eventDate} • 🕒 ${eventTime}</div>
            </div>
            
            <div class="content">
              <p>Hola <strong>${attendeeName}</strong>, aquí tienes tu entrada:</p>
              
              <div class="ticket-card">
                <div class="ticket-info">
                  <div class="info-row">
                    <span class="label">Asistente</span>
                    <span class="value">${attendeeName}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Zona</span>
                    <span class="value">${zone}</span>
                  </div>
                  ${seat ? `
                  <div class="info-row">
                    <span class="label">Asiento</span>
                    <span class="value">${seat}</span>
                  </div>
                  ` : ''}
                  <div class="info-row">
                    <span class="label">Ubicación</span>
                    <span class="value">${eventLocation}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Ticket ID</span>
                    <span class="value" style="font-family: monospace;">${ticketId}</span>
                  </div>
                </div>

                <img src="${qrUrl}" alt="Ticket QR Code" class="qr-code" />
                
                <p style="font-size: 12px; color: #666; margin-top: 10px;">
                  Presenta este código QR en la entrada del evento
                </p>
              </div>

              <a href="${APP_URL}" class="button">Ver Detalles del Evento</a>
            </div>
            
            <div class="footer">
              <p>Este ticket es personal e intransferible.</p>
              <p>Enviado a través de Holifes</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const resend = getResendClient();
    const senderEmail = process.env.RESEND_FROM_EMAIL || FROM_EMAIL;

    console.log(`📧 Sending ticket from: ${senderEmail}`);

    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: `🎟️ Tu entrada para ${eventName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw new Error(`Resend API Error: ${error.message}`);
    }

    console.log(`✅ Ticket sent to: ${email}`, data);
  } catch (error) {
    console.error('Error sending ticket email:', error);
    throw error;
  }
}
