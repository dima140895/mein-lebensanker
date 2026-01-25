import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stripe Price IDs
const PRICES = {
  single: "price_1StQxpICzkfBNYhyfkFifG39",
  couple: "price_1StQy5ICzkfBNYhyGqh7RUsk",
  family: "price_1StQyTICzkfBNYhyNTAl4QrA",
  update_service: "price_1StQyfICzkfBNYhyTXftLV1j",
};

const PACKAGE_PRICES = {
  single: 3900,
  couple: 4900,
  family: 9900,
};

const MAX_PROFILES = {
  single: 1,
  couple: 2,
  family: 4,
};

type PackageType = "single" | "couple" | "family";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    const { paymentType, isUpgrade, currentTier, includeUpdateService } = await req.json();
    
    const validTypes = ["single", "couple", "family"];
    if (!paymentType || !validTypes.includes(paymentType)) {
      throw new Error("Invalid payment type. Must be 'single', 'couple', or 'family'");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (isUpgrade && currentTier && validTypes.includes(currentTier)) {
      // Calculate upgrade price
      const currentPrice = PACKAGE_PRICES[currentTier as PackageType];
      const newPrice = PACKAGE_PRICES[paymentType as PackageType];
      const upgradeAmount = newPrice - currentPrice;

      if (upgradeAmount <= 0) {
        throw new Error("Invalid upgrade: new package must be more expensive");
      }

      // Create a price for the upgrade amount
      const upgradePrice = await stripe.prices.create({
        unit_amount: upgradeAmount,
        currency: "eur",
        product_data: {
          name: `Upgrade von ${currentTier} zu ${paymentType}`,
        },
      });

      lineItems.push({
        price: upgradePrice.id,
        quantity: 1,
      });
    } else {
      // Regular purchase
      lineItems.push({
        price: PRICES[paymentType as PackageType],
        quantity: 1,
      });
    }

    // Add update service subscription if requested
    if (includeUpdateService) {
      lineItems.push({
        price: PRICES.update_service,
        quantity: 1,
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: includeUpdateService ? "subscription" : "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=${paymentType}${isUpgrade ? "&upgrade=true" : ""}`,
      cancel_url: `${req.headers.get("origin")}/dashboard`,
      metadata: {
        user_id: user.id,
        payment_type: paymentType,
        is_upgrade: isUpgrade ? "true" : "false",
        max_profiles: String(MAX_PROFILES[paymentType as PackageType]),
        include_update_service: includeUpdateService ? "true" : "false",
      },
    };

    // For mixed mode (one-time + subscription), use subscription mode
    if (includeUpdateService && !isUpgrade) {
      // Add the one-time package as an invoice item
      sessionParams.subscription_data = {
        metadata: {
          user_id: user.id,
          payment_type: paymentType,
          max_profiles: String(MAX_PROFILES[paymentType as PackageType]),
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Payment error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
