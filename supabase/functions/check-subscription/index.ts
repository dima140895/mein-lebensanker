import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Check local subscription record first
    const { data: subData } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subData) {
      return new Response(JSON.stringify({ subscribed: false, plan: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For one-time payments (anker), just return the stored status
    if (subData.plan === "anker") {
      return new Response(JSON.stringify({
        subscribed: true,
        plan: "anker",
        status: "active",
        active_modules: subData.active_modules,
        max_profiles: subData.max_profiles,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For subscriptions, verify with Stripe
    if (subData.stripe_subscription_id) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

      try {
        const sub = await stripe.subscriptions.retrieve(subData.stripe_subscription_id);
        const isActive = ["active", "trialing"].includes(sub.status);

        // Update local record
        const updateData: Record<string, unknown> = {
          status: sub.status,
        };
        if (sub.trial_end) {
          updateData.trial_end = new Date(sub.trial_end * 1000).toISOString();
        }
        if (sub.current_period_end) {
          updateData.current_period_end = new Date(sub.current_period_end * 1000).toISOString();
        }

        await supabaseClient
          .from("subscriptions")
          .update(updateData)
          .eq("id", subData.id);

        // If subscription is no longer active, update profile
        if (!isActive) {
          // Downgrade to anker-level access if they had paid for anker before
          await supabaseClient
            .from("profiles")
            .update({ purchased_tier: "anker", max_profiles: 1 })
            .eq("user_id", user.id);
        }

        return new Response(JSON.stringify({
          subscribed: isActive,
          plan: subData.plan,
          status: sub.status,
          active_modules: isActive ? subData.active_modules : ["vorsorge"],
          max_profiles: isActive ? subData.max_profiles : 1,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch {
        // Stripe error - return cached data
        return new Response(JSON.stringify({
          subscribed: ["active", "trialing"].includes(subData.status),
          plan: subData.plan,
          status: subData.status,
          active_modules: subData.active_modules,
          max_profiles: subData.max_profiles,
          trial_end: subData.trial_end,
          current_period_end: subData.current_period_end,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    return new Response(JSON.stringify({
      subscribed: ["active", "trialing"].includes(subData.status),
      plan: subData.plan,
      status: subData.status,
      active_modules: subData.active_modules,
      max_profiles: subData.max_profiles,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
