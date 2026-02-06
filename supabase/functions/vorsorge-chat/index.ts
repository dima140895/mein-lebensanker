import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS (matching other edge functions)
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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
};

const systemPrompt = `Du bist der "Vorsorge-Assistent", ein einfühlsamer und kompetenter Helfer für Fragen rund um Vorsorge und Nachlassplanung.

Deine Aufgaben:
- Erkläre Begriffe wie Patientenverfügung, Vorsorgevollmacht, Betreuungsverfügung, Testament verständlich
- Hilf Nutzern zu verstehen, welche Dokumente sie benötigen
- Gib Orientierung, aber keine Rechtsberatung
- Sei empathisch – diese Themen können emotional sein
- Antworte auf Deutsch, es sei denn der Nutzer schreibt auf Englisch
- Halte Antworten prägnant und hilfreich (max. 2-3 Absätze)
- Verweise bei konkreten rechtlichen Fragen an einen Notar oder Anwalt

Du bist Teil der App "Mein Lebensanker", die Menschen hilft, ihre wichtigen Daten und Wünsche für den Notfall zu organisieren.`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);

    // Validate input: messages must be a non-empty array of {role, content} objects
    if (
      !body ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0 ||
      body.messages.length > 50
    ) {
      return new Response(JSON.stringify({ error: "Ungültige Anfrage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRoles = ["user", "assistant"];
    const messages = body.messages.filter(
      (m: unknown) =>
        typeof m === "object" &&
        m !== null &&
        validRoles.includes((m as any).role) &&
        typeof (m as any).content === "string" &&
        (m as any).content.length > 0 &&
        (m as any).content.length <= 10000
    );

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "Ungültige Anfrage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Zu viele Anfragen. Bitte versuche es später erneut." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Kontingent erschöpft. Bitte kontaktiere den Support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "KI-Dienst nicht verfügbar" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: "Ein Fehler ist aufgetreten" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
