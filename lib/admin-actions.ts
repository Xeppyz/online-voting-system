"use server"

import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

// Initialize Admin Client with Service Role Key
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)

const resend = new Resend(process.env.RESEND_API_KEY)

export interface AdminUser {
    id: string
    email: string
    created_at: string
    last_sign_in_at: string
}

export async function getAdminUsers() {
    try {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

        if (error) {
            console.error("Supabase Admin Error:", error)
            return { success: false, error: error.message }
        }

        // Map to simplified structure
        const mappedUsers: AdminUser[] = users.map(u => ({
            id: u.id,
            email: u.email || "",
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at || "",
        }))

        return { success: true, users: mappedUsers }
    } catch (error) {
        console.error("Internal Admin Error:", error)
        return { success: false, error: "Failed to fetch users" }
    }
}

export async function sendMassReminder(emails: string[]) {
    // Production URL
    const baseUrl = "https://clikawards.com"

    if (!emails || emails.length === 0) {
        return { success: false, error: "No recipients" }
    }

    let successCount = 0
    let failCount = 0

    // Loop sending (Resend handles batching in paid plans, but loop is safer for free tier/simple setup)
    // For larger scale, use Resend Batch API
    for (const email of emails) {
        try {
            const { error } = await resend.emails.send({
                from: "Clik Awards <info@clikawards.com>",
                to: email,
                subject: "📢 Recordatorio - Clik Awards 2026",
                html: `
        <!DOCTYPE html>
        <html>
          <body style="margin: 0; padding: 0; background-color: #000000; font-family: sans-serif; color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden;">
                    <tr>
                      <td align="center" style="padding: 40px 0 20px;">
                        <img src="${baseUrl}/icon/ClikHFull.png" alt="Clik Awards" width="180" />
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 40px 40px; text-align: center;">
                        <h1 style="font-size: 24px; margin-bottom: 20px;">Recordatorio Importante</h1>
                        <p style="color: #888; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                          ¡Falta muy poco para el inicio de las votaciones! Prepárate para apoyar a tus favoritos.
                        </p>
                        <a href="${baseUrl}" style="display: inline-block; background-color: #3ffcff; color: #000; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 4px;">
                          Ir al Sitio Web
                        </a>
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

            if (!error) successCount++
            else failCount++

        } catch (err) {
            console.error(`Failed to send to ${email}`, err)
            failCount++
        }
    }

    return { success: true, sent: successCount, failed: failCount }
}
