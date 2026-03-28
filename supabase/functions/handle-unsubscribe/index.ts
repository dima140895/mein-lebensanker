import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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
    const { user_id } = await req.json();

    if (!user_id || typeof user_id !== "string" || user_id.length < 10) {
      return new Response(JSON.stringify({ error: "Invalid user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check if preferences exist
    const { data: existing } = await supabase
      .from("reminder_preferences")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (existing) {
      await supabase
        .from("reminder_preferences")
        .update({
          email_unsubscribed: true,
          daily_checkin_enabled: false,
          weekly_summary_enabled: false,
        })
        .eq("user_id", user_id);
    } else {
      await supabase
        .from("reminder_preferences")
        .insert({
          user_id,
          email_unsubscribed: true,
          daily_checkin_enabled: false,
          weekly_summary_enabled: false,
        });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
