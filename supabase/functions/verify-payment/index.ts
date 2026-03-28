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

const PLAN_MODULES: Record<string, string[]> = {
  anker: ["vorsorge"],
  plus: ["vorsorge", "pflege-begleiter", "krankheits-begleiter"],
  familie: ["vorsorge", "pflege-begleiter", "krankheits-begleiter", "familienfreigabe"],
};

const PLAN_MAX_PROFILES: Record<string, number> = {
  anker: 1,
  plus: 1,
  familie: 10,
};

const VerifyPaymentSchema = z.object({
  sessionId: z.string().min(1).max(500),
  plan: z.enum(["anker", "plus", "familie"]).optional(),
  referralCode: z.string().max(20).optional(),
});

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const authenticatedUserId = authData.user.id;

    const rawBody = await req.json();
    const parseResult = VerifyPaymentSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { sessionId, plan: planParam, referralCode } = parseResult.data;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Security: verify session belongs to user
    if (session.metadata?.user_id && session.metadata.user_id !== authenticatedUserId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const plan = planParam || session.metadata?.plan || "anker";
    const maxProfiles = PLAN_MAX_PROFILES[plan] || 1;
    const modules = PLAN_MODULES[plan] || ["vorsorge"];

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (session.mode === "payment" && session.payment_status === "paid") {
      // One-time payment (Anker)
      // Update profile
      await supabaseAdmin
        .from("profiles")
        .update({
          has_paid: true,
          payment_type: plan,
          purchased_tier: plan,
          max_profiles: maxProfiles,
        })
        .eq("user_id", authenticatedUserId);

      // Upsert subscription record
      await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: authenticatedUserId,
          plan,
          status: "active",
          active_modules: modules,
          max_profiles: maxProfiles,
          stripe_customer_id: session.customer as string || null,
        }, { onConflict: "user_id" })
        .select();

      // Track referral conversion if applicable
      if (referralCode) {
        await supabaseAdmin.rpc("increment_referral_conversions", { _code: referralCode });
      }

      return new Response(JSON.stringify({
        success: true,
        paymentStatus: "paid",
        plan,
        maxProfiles,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (session.mode === "subscription") {
      // Subscription (Plus or Familie)
      const subscriptionId = session.subscription as string;
      let status = "active";
      let trialEnd: string | null = null;
      let periodEnd: string | null = null;

      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        status = sub.status === "trialing" ? "trialing" : sub.status === "active" ? "active" : sub.status;
        if (sub.trial_end) {
          trialEnd = new Date(sub.trial_end * 1000).toISOString();
        }
        if (sub.current_period_end) {
          periodEnd = new Date(sub.current_period_end * 1000).toISOString();
        }
      }

      // Update profile
      await supabaseAdmin
        .from("profiles")
        .update({
          has_paid: true,
          payment_type: plan,
          purchased_tier: plan,
          max_profiles: maxProfiles,
        })
        .eq("user_id", authenticatedUserId);

      // Upsert subscription record
      await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: authenticatedUserId,
          plan,
          status,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string || null,
          trial_end: trialEnd,
          current_period_end: periodEnd,
          active_modules: modules,
          max_profiles: maxProfiles,
        }, { onConflict: "user_id" })
        .select();

      return new Response(JSON.stringify({
        success: true,
        paymentStatus: "paid",
        plan,
        maxProfiles,
        status,
        trialEnd,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({
      success: false,
      paymentStatus: session.payment_status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: "Verification failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
