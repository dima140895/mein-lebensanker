import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://mein-lebensanker.lovable.app",
  "https://id-preview--3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovable.app",
];

// In-memory rate limiting (per email, max 1 per 5 minutes)
const emailRateLimits = new Map<string, number>();
const EMAIL_RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

// Clean up old rate limit entries periodically
const cleanupRateLimits = () => {
  const now = Date.now();
  for (const [key, timestamp] of emailRateLimits.entries()) {
    if (now - timestamp > EMAIL_RATE_LIMIT_MS) {
      emailRateLimits.delete(key);
    }
  }
};

const getCorsHeaders = (origin: string | null) => {
  // Allow lovableproject.com origins for preview environments
  const isLovablePreview = origin && origin.includes('.lovableproject.com');
  const allowedOrigin = isLovablePreview 
    ? origin 
    : (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace(/\/$/, ''))) 
      ? origin 
      : ALLOWED_ORIGINS[0]);
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

// Input validation schema with strict patterns
const VerificationRequestSchema = z.object({
  email: z.string().email().max(255).transform(val => val.toLowerCase().trim()),
  confirmationUrl: z.string().url().max(2000),
  userName: z.string().max(100).optional().transform(val => val ? val.replace(/[<>]/g, '') : undefined),
});

// Allowed URL prefixes for confirmation URLs
const VALID_URL_PREFIXES = [
  "https://mein-lebensanker.lovable.app",
  "https://id-preview--3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovable.app",
];

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Cleanup old rate limit entries
    cleanupRateLimits();

    // Parse and validate request body with Zod
    const rawBody = await req.json();
    const parseResult = VerificationRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, confirmationUrl, userName } = parseResult.data;

    // Validate confirmation URL against allowlist
    const isValidUrl = VALID_URL_PREFIXES.some(prefix => confirmationUrl.startsWith(prefix)) ||
                       confirmationUrl.includes('.lovableproject.com');

    if (!isValidUrl) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize email for rate limiting
    const normalizedEmail = email;

    // Check rate limit for this email
    const lastRequestTime = emailRateLimits.get(normalizedEmail);
    if (lastRequestTime && Date.now() - lastRequestTime < EMAIL_RATE_LIMIT_MS) {
      const remainingSeconds = Math.ceil((EMAIL_RATE_LIMIT_MS - (Date.now() - lastRequestTime)) / 1000);
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: {
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(remainingSeconds)
          },
        }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Search for user with this email
    const { data: userByEmail } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = userByEmail?.users?.some(u => u.email?.toLowerCase() === normalizedEmail);

    if (!userExists) {
      // Record rate limit to prevent abuse and return generic success to prevent email enumeration
      emailRateLimits.set(normalizedEmail, Date.now());
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record the request for rate limiting
    emailRateLimits.set(normalizedEmail, Date.now());

    // Use Supabase's built-in resend confirmation to get a fresh token
    // This uses the 'magiclink' type which works for email verification
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: confirmationUrl,
      },
    });

    let fullConfirmationUrl = confirmationUrl;
    
    if (linkError) {
      // If we can't generate a link (user might not exist yet), just use the base URL
      // The verification will need to be done via Supabase's built-in flow
    } else if (linkData?.properties?.hashed_token) {
      // Extract the token_hash and build the verification URL
      const verificationToken = linkData.properties.hashed_token;
      fullConfirmationUrl = `${confirmationUrl}?token_hash=${verificationToken}&type=magiclink`;
    }

    // Sanitize display name for HTML context
    const displayName = userName ? userName.replace(/[<>&"']/g, '') : "Nutzer";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Mein Lebensanker <noreply@mein-lebensanker.de>",
        to: [email],
        subject: "Bestätigen Sie Ihre E-Mail-Adresse",
        html: `
          <!DOCTYPE html>
          <html lang="de">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-radius: 12px 12px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">⚓ Mein Lebensanker</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; color: #1e3a5f; font-size: 24px;">Willkommen, ${displayName}!</h2>
                        <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                          Vielen Dank für Ihre Registrierung bei Mein Lebensanker. Um Ihr Konto zu aktivieren und alle Funktionen nutzen zu können, bestätigen Sie bitte Ihre E-Mail-Adresse.
                        </p>
                        
                        <!-- CTA Button -->
                        <table role="presentation" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${fullConfirmationUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(30, 58, 95, 0.3);">
                                E-Mail-Adresse bestätigen
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 20px 0 0 0; color: #777777; font-size: 14px; line-height: 1.6;">
                          Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:
                        </p>
                        <p style="margin: 10px 0 0 0; color: #1e3a5f; font-size: 14px; word-break: break-all;">
                          ${fullConfirmationUrl}
                        </p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;">
                        
                        <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                          Falls Sie sich nicht bei Mein Lebensanker registriert haben, können Sie diese E-Mail ignorieren.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
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
      return new Response(
        JSON.stringify({ error: "Operation failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const responseData = await emailResponse.json();

    return new Response(JSON.stringify({ success: true, id: responseData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: "Operation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
