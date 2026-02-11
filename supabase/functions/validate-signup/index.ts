import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://mein-lebensanker.lovable.app",
  "https://id-preview--3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovable.app",
  "https://3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovableproject.com",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin =
    origin &&
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, "")))
      ? origin
      : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// Server-side password policy — must match client-side requirements
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password || typeof password !== "string") {
    return { valid: false, errors: ["Password is required."] };
  }
  if (password.length < 6) {
    errors.push("Mindestens 6 Zeichen erforderlich.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Mindestens ein Großbuchstabe erforderlich.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Mindestens ein Kleinbuchstabe erforderlich.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Mindestens eine Zahl erforderlich.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Mindestens ein Sonderzeichen erforderlich.");
  }

  return { valid: errors.length === 0, errors };
}

function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  if (email.length > 255) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
// Simple in-memory rate limiter (per IP/email, 5 requests per 10 minutes)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 600_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, emailRedirectTo } = await req.json();

    // Rate limit per email
    const normalizedEmail = String(email || "").toLowerCase().trim();
    if (isRateLimited(normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Zu viele Anfragen. Bitte versuche es später erneut." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Ungültige E-Mail-Adresse." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password server-side
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return new Response(
        JSON.stringify({
          error: "Passwort erfüllt nicht die Anforderungen.",
          details: passwordCheck.errors,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client to perform signup
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Perform the actual signup via Supabase Auth Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User must verify email
    });

    if (error) {
      // Handle "already registered" gracefully (same as client-side behavior)
      if (error.message?.includes("already been registered") || error.message?.includes("already exists")) {
        return new Response(
          JSON.stringify({
            data: { user: { id: "existing", identities: [] } },
            error: null,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        data: {
          user: data.user
            ? {
                id: data.user.id,
                email: data.user.email,
                identities: data.user.identities ?? [],
              }
            : null,
        },
        error: null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Interner Serverfehler." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
