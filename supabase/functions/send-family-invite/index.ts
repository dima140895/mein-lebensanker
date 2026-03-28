import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const ALLOWED_ORIGINS = [
  "https://mein-lebensanker.lovable.app",
  "https://mein-lebensanker.de",
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

const VALID_ROLES = ["lesen", "mitbearbeiten"];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  // Content-Type check
  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return new Response(JSON.stringify({ error: "Content-Type muss application/json sein" }), {
      status: 415, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    // Verify JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const anonClient = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Safe JSON parse
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Ungültiges JSON" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const memberEmail = body.memberEmail as string;
    const rolle = body.rolle as string;
    const ownerName = body.ownerName as string;

    // Validate email format and length
    if (!memberEmail || typeof memberEmail !== "string" || !emailRegex.test(memberEmail) || memberEmail.length > 254) {
      return new Response(JSON.stringify({ error: "Ungültige E-Mail-Adresse" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate role
    if (!rolle || !VALID_ROLES.includes(rolle)) {
      return new Response(JSON.stringify({ error: "Ungültige Rolle" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user's plan limits
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const plan = subscription?.plan;
    const maxMembers = plan === "familie" ? 10 : plan === "plus" ? 5 : 0;

    if (maxMembers === 0) {
      return new Response(JSON.stringify({ error: "Family feature requires Plus or Familie plan" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Count existing members (all statuses)
    const { count } = await supabase
      .from("familienzugang")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);

    if ((count || 0) >= maxMembers) {
      return new Response(JSON.stringify({ error: "Mitgliederlimit erreicht", max: maxMembers }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert invitation
    const { data: invitation, error: insertError } = await supabase
      .from("familienzugang")
      .insert({
        owner_id: user.id,
        member_email: memberEmail.toLowerCase().trim(),
        rolle,
      })
      .select("invitation_token")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return new Response(JSON.stringify({ error: "Already invited" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw insertError;
    }

    // Build invitation link
    const appUrl = "https://mein-lebensanker.lovable.app";
    const inviteLink = `${appUrl}/familie-einladung/${invitation.invitation_token}`;

    const senderName = typeof ownerName === "string" && ownerName.trim() ? ownerName.trim().slice(0, 100) : "Jemand";

    // Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mein Lebensanker <noreply@mein-lebensanker.de>",
        to: [memberEmail],
        subject: `${senderName} hat dich zu Mein Lebensanker eingeladen`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #4A5043;">
            <h1 style="font-size: 24px; color: #4A5043; margin-bottom: 20px;">
              Einladung zur Familienfreigabe
            </h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              ${senderName} hat dich eingeladen, gemeinsam die Vorsorge und 
              Pflege-Dokumentation auf <strong>Mein Lebensanker</strong> zu verwalten.
            </p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Klicke auf den Button unten, um die Einladung anzunehmen:
            </p>
            <a href="${inviteLink}" 
               style="display: inline-block; background-color: #7C8B6F; color: #ffffff; 
                      padding: 14px 28px; text-decoration: none; border-radius: 8px; 
                      font-size: 16px; font-weight: 500;">
              Einladung annehmen →
            </a>
            <p style="font-size: 13px; color: #999; margin-top: 40px; line-height: 1.5;">
              Falls du diese E-Mail nicht erwartet hast, kannst du sie ignorieren.
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const emailError = await emailRes.text();
      console.error("Resend error:", emailError);
      // Don't fail the whole request - invitation is already saved
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
