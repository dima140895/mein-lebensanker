const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

const VALID_TYPES = ["pflegestuetzpunkt", "notar", "krankenkasse", "sonstiges"];

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
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
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

    const { name, organisation, email, typ, nachricht } = body as Record<string, string>;

    // Validate required fields
    if (
      typeof name !== "string" || !name.trim() || name.length > 100 ||
      typeof organisation !== "string" || !organisation.trim() || organisation.length > 200 ||
      typeof email !== "string" || !email.trim() || email.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof typ !== "string" || !VALID_TYPES.includes(typ)
    ) {
      return new Response(JSON.stringify({ error: "Ungültige Eingabe" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeNachricht = typeof nachricht === "string" ? nachricht.slice(0, 2000) : "";

    const typLabels: Record<string, string> = {
      pflegestuetzpunkt: "Pflegestützpunkt",
      notar: "Notar / Rechtsanwalt",
      krankenkasse: "Krankenkasse",
      sonstiges: "Sonstiges",
    };

    const emailBody = `
Neue Partneranfrage über mein-lebensanker.de

Name: ${name.trim()}
Organisation: ${organisation.trim()}
E-Mail: ${email.trim()}
Typ: ${typLabels[typ] || typ}

Nachricht:
${safeNachricht || "(keine Nachricht)"}
    `.trim();

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mein Lebensanker <noreply@mein-lebensanker.de>",
        to: ["hallo@mein-lebensanker.de"],
        reply_to: email.trim(),
        subject: `Neue Partneranfrage: ${name.trim()} von ${organisation.trim()}`,
        text: emailBody,
      }),
    });

    if (!resendRes.ok) {
      const errorText = await resendRes.text();
      console.error(`Resend API error [${resendRes.status}]: ${errorText}`);
      return new Response(JSON.stringify({ error: "E-Mail konnte nicht gesendet werden" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await resendRes.json();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-partner-inquiry:", error);
    return new Response(JSON.stringify({ error: "Interner Fehler" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
