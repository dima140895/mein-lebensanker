import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  "https://mein-lebensanker.lovable.app",
  "https://mein-lebensanker.de",
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

// Server-side price mapping — never trust client-provided priceIds
const VALID_PLANS = ['anker', 'plus', 'familie'] as const;
type Plan = typeof VALID_PLANS[number];

const PRICES: Record<Plan, string> = {
  anker: "price_1TFxsEEwPqOvJ6cUDbqzpbmI",
  plus: "price_1TFxtDICzkfBNYhy7DjVuBt7",
  familie: "price_1TFxtdICzkfBNYhyZbGYHWYU",
};

const PLAN_CONFIG: Record<Plan, { mode: "payment" | "subscription"; trialDays: number; maxProfiles: number }> = {
  anker: { mode: "payment", trialDays: 0, maxProfiles: 1 },
  plus: { mode: "subscription", trialDays: 14, maxProfiles: 1 },
  familie: { mode: "subscription", trialDays: 14, maxProfiles: 10 },
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    const user = data?.user;

    if (authError || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Safe JSON parse
    let rawBody: Record<string, unknown>;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Ungültiges JSON" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate plan
    const plan = rawBody?.plan as string;
    if (!plan || !(VALID_PLANS as readonly string[]).includes(plan)) {
      return new Response(JSON.stringify({ error: "Ungültiger Plan" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const validPlan = plan as Plan;
    const config = PLAN_CONFIG[validPlan];
    // Always use server-side price mapping
    const priceId = PRICES[validPlan];

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || ALLOWED_ORIGINS[0];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: config.mode,
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${validPlan}`,
      cancel_url: `${origin}/dashboard`,
      locale: "de",
      metadata: {
        user_id: user.id,
        plan: validPlan,
        max_profiles: String(config.maxProfiles),
      },
    };

    // Add trial for subscription plans
    if (config.mode === "subscription" && config.trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: config.trialDays,
        metadata: {
          user_id: user.id,
          plan: validPlan,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: "Payment processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
