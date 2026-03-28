import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

// Price IDs
const PRICES = {
  anker: "price_1TFxsEEwPqOvJ6cUDbqzpbmI",
  plus: "price_1TFxtDICzkfBNYhy7DjVuBt7",
  familie: "price_1TFxtdICzkfBNYhyZbGYHWYU",
};

const PLAN_CONFIG = {
  anker: { mode: "payment" as const, trialDays: 0, maxProfiles: 1 },
  plus: { mode: "subscription" as const, trialDays: 14, maxProfiles: 1 },
  familie: { mode: "subscription" as const, trialDays: 14, maxProfiles: 10 },
};

const PaymentRequestSchema = z.object({
  plan: z.enum(["anker", "plus", "familie"]),
});

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    const rawBody = await req.json();
    const parseResult = PaymentRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request parameters" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { plan } = parseResult.data;
    const config = PLAN_CONFIG[plan];
    const priceId = PRICES[plan];

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
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${origin}/dashboard`,
      locale: "de",
      metadata: {
        user_id: user.id,
        plan,
        max_profiles: String(config.maxProfiles),
      },
    };

    // Add trial for subscription plans
    if (config.mode === "subscription" && config.trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: config.trialDays,
        metadata: {
          user_id: user.id,
          plan,
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
