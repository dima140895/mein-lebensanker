import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl, userName } = await req.json();

    if (!email || !confirmationUrl) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Generate magic link for verification
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
      options: { redirectTo: confirmationUrl },
    });

    let fullConfirmationUrl = confirmationUrl;
    
    if (!linkError && linkData?.properties?.hashed_token) {
      const verificationToken = linkData.properties.hashed_token;
      fullConfirmationUrl = `${confirmationUrl}?token_hash=${verificationToken}&type=magiclink`;
    }

    const displayName = userName ? userName.replace(/[<>&"']/g, '') : "Nutzer";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Mein Lebensanker <noreply@mein-lebensanker.de>",
        to: [normalizedEmail],
        subject: "Bestätigen Sie Ihre E-Mail-Adresse",
        html: `
          <!DOCTYPE html>
          <html lang="de">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-radius: 12px 12px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">⚓ Mein Lebensanker</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; color: #1e3a5f; font-size: 24px;">Willkommen, ${displayName}!</h2>
                        <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                          Vielen Dank für Ihre Registrierung. Um Ihr Konto zu aktivieren, bestätigen Sie bitte Ihre E-Mail-Adresse.
                        </p>
                        <table role="presentation" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${fullConfirmationUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                                E-Mail-Adresse bestätigen
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 20px 0 0 0; color: #777777; font-size: 14px;">
                          Falls der Button nicht funktioniert, kopieren Sie diesen Link:
                        </p>
                        <p style="margin: 10px 0 0 0; color: #1e3a5f; font-size: 14px; word-break: break-all;">
                          ${fullConfirmationUrl}
                        </p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;">
                        <p style="margin: 0; color: #999999; font-size: 13px;">
                          Falls Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                        <p style="margin: 0; color: #999999; font-size: 12px;">
                          © 2026 Mein Lebensanker. Alle Rechte vorbehalten.
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
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responseData = await emailResponse.json();
    return new Response(JSON.stringify({ success: true, id: responseData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Operation failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
