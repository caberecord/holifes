// Email sending function for staff credentials

import { getResendClient, FROM_EMAIL, APP_URL } from './resend';
import { Event } from '../../types/event';

interface SendStaffCredentialsParams {
  email: string;
  password: string;
  assignedEvents: Event[];
}

export async function sendStaffCredentials({
  email,
  password,
  assignedEvents,
}: SendStaffCredentialsParams): Promise<void> {
  try {
    const eventsList = assignedEvents
      .map((event) => `• ${event.name || event.title} - ${event.date}`)
      .join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px 20px;
              border-radius: 0 0 10px 10px;
            }
            .credentials-box {
              background: white;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .credential-item {
              margin: 10px 0;
              padding: 10px;
              background: #f3f4f6;
              border-radius: 5px;
            }
            .credential-label {
              font-weight: bold;
              color: #6366f1;
              font-size: 12px;
              text-transform: uppercase;
            }
            .credential-value {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              font-family: monospace;
            }
            .button {
              display: inline-block;
              background: #6366f1;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .events-list {
              background: white;
              border-left: 4px solid #6366f1;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #6b7280;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Bienvenido a Holifes</h1>
            <p>Has sido agregado como personal de validación</p>
          </div>
          
          <div class="content">
            <h2>🔐 Tus Credenciales de Acceso</h2>
            
            <div class="credentials-box">
              <div class="credential-item">
                <div class="credential-label">📧 Email</div>
                <div class="credential-value">${email}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">🔑 Contraseña Temporal</div>
                <div class="credential-value">${password}</div>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Esta contraseña es temporal. Por seguridad, cámbiala después de tu primer inicio de sesión.
            </div>
            
            <center>
              <a href="${APP_URL}/login" class="button">
                🚀 Iniciar Sesión Ahora
              </a>
            </center>
            
            <h3>📅 Eventos Asignados</h3>
            <div class="events-list">
              <p>Tienes acceso para validar tickets en los siguientes eventos:</p>
              <pre style="font-family: inherit; margin: 10px 0;">${eventsList}</pre>
            </div>
            
            <h3>📱 Instrucciones de Uso</h3>
            <ol>
              <li>Inicia sesión con tus credenciales</li>
              <li>Serás redirigido automáticamente a la página de check-in</li>
              <li>Selecciona el evento de la lista</li>
              <li>Permite el acceso a la cámara cuando se solicite</li>
              <li>Escanea los códigos QR de los tickets</li>
              <li>El sistema validará automáticamente cada ticket</li>
            </ol>
            
            <div class="footer">
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
              <p>Si tienes problemas para acceder, contacta al organizador del evento.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const resend = getResendClient();
    const senderEmail = process.env.RESEND_FROM_EMAIL || FROM_EMAIL;

    // console.log(`📧 Sending email from: ${senderEmail}`);

    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: '🎫 Credenciales de Acceso - Sistema de Check-In',
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw new Error(`Resend API Error: ${error.message}`);
    }

    // console.log(`✅ Staff credentials sent to: ${email}`, data);
  } catch (error) {
    console.error('Error sending staff credentials email:', error);
    throw error; // Re-throw to be caught by the API route
  }
}
