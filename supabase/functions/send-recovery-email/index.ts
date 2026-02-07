import { createClient } from "npm:@supabase/supabase-js@2";

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
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, "")))
      ? origin
      : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
};

// Robust HTML escaping
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required env vars");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.email !== "string" || typeof body.redirectTo !== "string") {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = String(body.email).toLowerCase().trim();
    const redirectTo = String(body.redirectTo);

    // Validate redirectTo against allowed origins to prevent phishing
    const isAllowedRedirect = ALLOWED_ORIGINS.some((o) =>
      redirectTo.startsWith(o.replace(/\/$/, ""))
    );
    if (!isAllowedRedirect) {
      return new Response(JSON.stringify({ error: "Invalid redirect URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate recovery link via admin API
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const generateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "recovery",
        email,
        options: { redirectTo },
      }),
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      console.error("generate_link error:", errText);
      // Don't reveal whether user exists
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const linkData = await generateRes.json();
    const hashed = linkData?.properties?.hashed_token;
    let recoveryUrl = redirectTo;

    if (hashed) {
      const joiner = redirectTo.includes("?") ? "&" : "?";
      recoveryUrl = `${redirectTo}${joiner}token_hash=${encodeURIComponent(hashed)}&type=recovery`;
    } else if (linkData?.action_link) {
      recoveryUrl = linkData.action_link;
    }

    // Get user's name for personalization
    let displayName = "Nutzer";
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("email", email)
      .maybeSingle();
    
    if (profile?.full_name) {
      const sanitized = String(profile.full_name).trim().slice(0, 100).replace(/[^\p{L}\p{N}\s.\-]/gu, "");
      displayName = sanitized.length > 0 ? escapeHtml(sanitized) : "Nutzer";
    }

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Mein Lebensanker <noreply@mein-lebensanker.de>",
        to: [email],
        subject: "Passwort zurücksetzen – Mein Lebensanker",
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
                          Du hast angefordert, Dein Passwort zurückzusetzen. Klicke auf den Button unten, um ein neues Passwort zu setzen.
                        </p>
                        <table role="presentation" style="width: 100%; margin: 0 0 28px 0;">
                          <tr>
                            <td align="center">
                              <a href="${recoveryUrl}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6b8f71 0%, #5a7a60 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 10px; box-shadow: 0 4px 14px rgba(107,143,113,0.35);">
                                🔑&nbsp; Passwort zurücksetzen
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 0 0 8px 0; color: #888888; font-size: 13px;">
                          Falls der Button nicht funktioniert, kopiere diesen Link:
                        </p>
                        <p style="margin: 0 0 0 0; color: #6b8f71; font-size: 13px; word-break: break-all; line-height: 1.5;">
                          ${recoveryUrl}
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
                          Falls Du kein Zurücksetzen angefordert hast, kannst Du diese E-Mail einfach ignorieren. Dein Passwort bleibt unverändert.
                        </p>
                        <p style="margin: 8px 0 0 0; color: #aaaaaa; font-size: 12px; line-height: 1.6;">
                          Dieser Link ist aus Sicherheitsgründen nur begrenzt gültig.
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
      const errText = await emailResponse.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resData = await emailResponse.json();
    console.log("Recovery email sent:", resData);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
    console.error("Error:", _err);
    return new Response(JSON.stringify({ error: "Operation failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
