import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://mein-lebensanker.lovable.app",
  "https://id-preview--3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovable.app",
  "https://3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovableproject.com",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace(/\/$/, '')))
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
};

type GenerateLinkResponse = {
  action_link?: string;
  properties?: {
    hashed_token?: string;
  };
};

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, confirmationUrl, userName } = await req.json();

    if (!email || !confirmationUrl) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const redirectTo = String(confirmationUrl);
    const displayName = userName ? String(userName).replace(/[<>&"']/g, "") : "Nutzer";

    // Build a verification URL that our /verify-email page can actually verify.
    // We generate a secure token server-side (service role) and append it as token_hash.
    let verificationUrl = redirectTo;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const generateLinkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "magiclink",
          email: normalizedEmail,
          options: {
            // We redirect to our app's verification page after verification.
            redirectTo,
          },
        }),
      });

      if (!generateLinkRes.ok) {
        const errorText = await generateLinkRes.text();
        console.error("generate_link error:", errorText);
      } else {
        const linkData = (await generateLinkRes.json()) as GenerateLinkResponse;
        const hashed = linkData?.properties?.hashed_token;

        if (hashed) {
          const joiner = redirectTo.includes("?") ? "&" : "?";
          verificationUrl = `${redirectTo}${joiner}token_hash=${encodeURIComponent(hashed)}&type=magiclink`;
        } else if (linkData?.action_link) {
          // Fallback: use action_link (will go through /auth/v1/verify and redirect back)
          verificationUrl = linkData.action_link;
        }
      }
    } else {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in function env");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
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
                              <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                                E-Mail-Adresse bestätigen
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 20px 0 0 0; color: #777777; font-size: 14px;">
                          Falls der Button nicht funktioniert, kopieren Sie diesen Link:
                        </p>
                        <p style="margin: 10px 0 0 0; color: #1e3a5f; font-size: 14px; word-break: break-all;">
                          ${verificationUrl}
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
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const responseData = await emailResponse.json();
    console.log("Email sent successfully:", responseData);

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
