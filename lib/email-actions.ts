"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string) {
  // Production URL
  const baseUrl = "https://clikawards.com"

  try {
    const { data, error } = await resend.emails.send({
      from: "Clik Awards <onboarding@resend.dev>",
      to: email,
      subject: "🎟️ Registro Confirmado - Clik Awards 2026",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Clik Awards 2026</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff;">
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #000000;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  
                  <!-- Main Container -->
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; max-width: 600px; width: 100%;">
                    
                    <!-- Header Image / Logo -->
                    <tr>
                      <td align="center" style="padding: 40px 0 20px 0; background-color: #0a0a0a;">
                        <img src="${baseUrl}/icon/ClikHFull.png" alt="Clik Awards Logo" width="180" style="display: block; width: 180px; height: auto;" />
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 0 40px 40px 40px; text-align: center;">
                        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.5px;">
                          ¡Estás dentro!
                        </h1>
                        <p style="color: #888888; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
                          Has confirmado tu pre-registro para la <strong>Primera Edición</strong> de los premios más ambiciosos de la región.
                        </p>
                        
                        <!-- Hero Image / Visual -->
                        <div style="margin-bottom: 32px; border-radius: 8px; overflow: hidden; border: 1px solid #222;">
                           <img src="${baseUrl}/side/side3.png" alt="Experience" width="100%" style="display: block; width: 100%; height: auto; opacity: 0.8;" />
                        </div>

                        <p style="color: #a1a1a1; font-size: 14px; line-height: 22px; margin-bottom: 32px;">
                          Te notificaremos a este correo electrónico el momento exacto en que inicie la votación. Prepárate para elegir a los mejores.
                        </p>

                        <!-- CTA Button (Fake) -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center">
                              <a href="${baseUrl}" style="display: inline-block; padding: 16px 32px; background-color: #3ffcff; color: #000000; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                                Ir al Sitio Oficial
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #050505; padding: 24px; text-align: center; border-top: 1px solid #1a1a1a;">
                        <p style="color: #444444; font-size: 12px; margin: 0;">
                          © 2026 Clik Awards. Todos los derechos reservados.
                        </p>
                        <p style="color: #444444; font-size: 12px; margin: 8px 0 0 0;">
                          Si no solicitaste este correo, puedes ignorarlo.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
            </table>

          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Resend Error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Internal Email Error:", error)
    return { success: false, error: "Failed to send email" }
  }
}
