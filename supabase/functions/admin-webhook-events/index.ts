import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // Verify admin role server-side
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: { email?: string; userId?: string; limit?: number } = {};
    try {
      body = await req.json();
    } catch {
      // empty body allowed
    }

    const limit = Math.min(Math.max(body.limit ?? 10, 1), 50);

    // Resolve target user
    let targetUserId: string | null = body.userId ?? null;
    let targetEmail: string | null = null;
    let targetSubscription: Record<string, unknown> | null = null;

    if (!targetUserId && body.email) {
      const { data: profile } = await admin
        .from("profiles")
        .select("user_id, email")
        .ilike("email", body.email.trim())
        .maybeSingle();
      if (profile) {
        targetUserId = profile.user_id;
        targetEmail = profile.email;
      }
    }

    if (targetUserId && !targetEmail) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email")
        .eq("user_id", targetUserId)
        .maybeSingle();
      targetEmail = profile?.email ?? null;
    }

    if (targetUserId) {
      const { data: sub } = await admin
        .from("subscriptions")
        .select("status, plan, active_modules, max_profiles, current_period_end, stripe_customer_id, stripe_subscription_id")
        .eq("user_id", targetUserId)
        .maybeSingle();
      targetSubscription = sub as Record<string, unknown> | null;
    }

    // Fetch events
    let query = admin
      .from("stripe_webhook_events")
      .select(
        "id, stripe_event_id, event_type, user_id, stripe_customer_id, stripe_subscription_id, previous_status, new_status, previous_plan, new_plan, previous_active_modules, new_active_modules, notes, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: events, error: eventsErr } = await query;
    if (eventsErr) {
      return new Response(JSON.stringify({ error: eventsErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        target: {
          user_id: targetUserId,
          email: targetEmail,
          subscription: targetSubscription,
        },
        events: events ?? [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
