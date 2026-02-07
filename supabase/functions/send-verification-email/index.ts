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
        subject: "Bestätige Deine E-Mail-Adresse – Mein Lebensanker",
        html: `
          <!DOCTYPE html>
          <html lang="de">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f3;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 16px;">
                  <table role="presentation" style="width: 560px; max-width: 100%; border-collapse: collapse;">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 32px 40px; text-align: center; background: linear-gradient(135deg, #6b8f71 0%, #5a7a60 100%); border-radius: 16px 16px 0 0;">
                        <div style="font-size: 32px; margin-bottom: 8px;">⚓</div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Mein Lebensanker</h1>
                        <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 400;">Deine Vorsorge. Deine Sicherheit.</p>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding: 36px 40px 32px 40px; background-color: #ffffff;">
                        <h2 style="margin: 0 0 16px 0; color: #2d3b2e; font-size: 20px; font-weight: 600;">Hallo ${displayName}!</h2>
                        <p style="margin: 0 0 24px 0; color: #555555; font-size: 15px; line-height: 1.7;">
                          Schön, dass Du dabei bist! Bitte bestätige Deine E-Mail-Adresse, um Dein Konto zu aktivieren.
                        </p>
                        <table role="presentation" style="width: 100%; margin: 0 0 28px 0;">
                          <tr>
                            <td align="center">
                              <a href="${verificationUrl}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6b8f71 0%, #5a7a60 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 10px; box-shadow: 0 4px 14px rgba(107,143,113,0.35);">
                                ✉️&nbsp; E-Mail bestätigen
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 0 0 8px 0; color: #888888; font-size: 13px;">
                          Falls der Button nicht funktioniert, kopiere diesen Link:
                        </p>
                        <p style="margin: 0 0 0 0; color: #6b8f71; font-size: 13px; word-break: break-all; line-height: 1.5;">
                          ${verificationUrl}
                        </p>
                      </td>
                    </tr>
                    <!-- Divider -->
                    <tr>
                      <td style="padding: 0 40px; background-color: #ffffff;">
                        <div style="border-top: 1px solid #e8ece9;"></div>
                      </td>
                    </tr>
                    <!-- Info -->
                    <tr>
                      <td style="padding: 20px 40px 28px 40px; background-color: #ffffff; border-radius: 0 0 16px 16px;">
                        <p style="margin: 0; color: #aaaaaa; font-size: 12px; line-height: 1.6;">
                          Falls Du Dich nicht registriert hast, kannst Du diese E-Mail einfach ignorieren.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 40px 0 40px; text-align: center;">
                        <p style="margin: 0; color: #b0b8b1; font-size: 11px;">
                          © ${new Date().getFullYear()} Mein Lebensanker · Alle Rechte vorbehalten
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
