import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Allowed origins for CORS
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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

const DEFAULT_MAX_PROFILES: Record<string, number> = {
  single: 1,
  couple: 2,
  family: 4, // Minimum for family, can be higher from metadata
};

// Input validation schema
const VerifyPaymentSchema = z.object({
  sessionId: z.string().min(1).max(500),
  userId: z.string().uuid().optional(),
  paymentType: z.enum(["single", "couple", "family"]).optional(),
});

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

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

    // Parse and validate request body with Zod
    const rawBody = await req.json();
    const parseResult = VerifyPaymentSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { sessionId, userId, paymentType } = parseResult.data;

    // Security check: Verify the authenticated user matches the claimed userId
    if (userId && userId !== authenticatedUserId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
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
      return new Response(JSON.stringify({ error: "Forbidden" }), {
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

      const tier = paymentType || session.metadata?.payment_type || "single";
      const isAddingProfiles = session.metadata?.is_adding_profiles === "true";
      const metadataMaxProfiles = session.metadata?.max_profiles ? parseInt(session.metadata.max_profiles) : null;

      // For adding profiles to family, use the new max from metadata
      // Otherwise use the tier default or metadata value
      let maxProfiles: number;
      if (isAddingProfiles && metadataMaxProfiles) {
        maxProfiles = metadataMaxProfiles;
      } else if (metadataMaxProfiles) {
        maxProfiles = metadataMaxProfiles;
      } else {
        maxProfiles = DEFAULT_MAX_PROFILES[tier] || 1;
      }

      // Only update the authenticated user's own profile
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ 
          has_paid: true, 
          payment_type: tier,
          purchased_tier: tier,
          max_profiles: maxProfiles,
        })
        .eq("user_id", authenticatedUserId);

      if (error) {
        return new Response(JSON.stringify({ error: "Failed to update payment status" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        paymentStatus: session.payment_status,
        tier,
        maxProfiles,
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
    return new Response(JSON.stringify({ error: "Verification failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
