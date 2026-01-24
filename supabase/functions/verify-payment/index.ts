import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication - require Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Create Supabase client with user's token to validate their identity
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user's identity
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const authenticatedUserId = authData.user.id;

    // Parse request body
    const { sessionId, userId, paymentType } = await req.json();

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing sessionId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Security check: Verify the authenticated user matches the claimed userId
    if (userId && userId !== authenticatedUserId) {
      return new Response(JSON.stringify({ error: "Forbidden: User mismatch" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Security check: Verify the Stripe session belongs to the authenticated user
    if (session.metadata?.user_id && session.metadata.user_id !== authenticatedUserId) {
      return new Response(JSON.stringify({ error: "Forbidden: Session does not belong to user" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    if (session.payment_status === "paid") {
      // Use service role to update profile (bypasses RLS)
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Only update the authenticated user's own profile
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ 
          has_paid: true, 
          payment_type: paymentType || session.metadata?.payment_type || "single"
        })
        .eq("user_id", authenticatedUserId);

      if (error) {
        console.error("Error updating profile:", error);
        return new Response(JSON.stringify({ error: "Failed to update payment status" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        paymentStatus: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      paymentStatus: session.payment_status 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Verification error:", errorMessage);
    return new Response(JSON.stringify({ error: "Verification failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});