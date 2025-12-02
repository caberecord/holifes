import { getResendClient, APP_URL, FROM_EMAIL } from './resend';
import { Event } from '../../types/event';

interface SendEventConfirmationParams {
  email: string;
  userName: string;
  event: Event;
}

export async function sendEventConfirmationEmail({
  email,
  userName,
  event,
}: SendEventConfirmationParams): Promise<void> {
  try {
    const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const eventTime = event.startTime; // startTime is already a string (HH:MM)

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            /* ... styles ... */
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Evento Creado Exitosamente! 🎉</h1>
            </div>
            
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              <p>Tu evento ha sido publicado y está listo para recibir asistentes. Aquí tienes los detalles principales:</p>
              
              <div class="event-card">
                <div class="event-title">${event.name || event.title}</div>
                <div class="event-detail">📅 ${eventDate}</div>
                <div class="event-detail">⏰ ${eventTime}</div>
                <div class="event-detail">📍 ${event.address || event.location || 'Ubicación por definir'}</div>
              </div>
              
              <p>Ahora puedes empezar a gestionar tus tickets, invitar a tu staff y promocionar tu evento.</p>
              
              <a href="${APP_URL}/dashboard/events" class="button">
                Gestionar mi Evento
              </a>
            </div>
            
            <div class="footer">
              <p>Enviado a través de Holifes</p>
              <p>© ${new Date().getFullYear()} Holifes. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const resend = getResendClient();
    const senderEmail = process.env.RESEND_FROM_EMAIL || FROM_EMAIL;

    // console.log(`📧 Sending confirmation from: ${senderEmail}`);

    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: `✅ Evento Creado: ${event.name || event.title}`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw new Error(`Resend API Error: ${error.message}`);
    }

    // console.log(`✅ Event confirmation sent to: ${email}`, data);
  } catch (error) {
    console.error('Error sending event confirmation email:', error);
    throw error;
  }
}
