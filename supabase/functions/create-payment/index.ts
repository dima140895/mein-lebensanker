import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://mein-lebensanker.lovable.app",
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

// Stripe Price IDs
const PRICES = {
  single: "price_1StQxpICzkfBNYhyfkFifG39",
  couple: "price_1StQy5ICzkfBNYhyGqh7RUsk",
  update_service: "price_1StQyfICzkfBNYhyTXftLV1j",
};

const PACKAGE_PRICES = {
  single: 3900,
  couple: 4900,
};

// Family pricing configuration
const FAMILY_PRICING = {
  basePrice: 5900, // 59 EUR in cents
  pricePerAdditionalProfile: 1900, // 19 EUR in cents
  minProfiles: 4,
  maxProfiles: 10,
};

const calculateFamilyPrice = (profileCount: number): number => {
  const clampedCount = Math.max(FAMILY_PRICING.minProfiles, Math.min(FAMILY_PRICING.maxProfiles, profileCount));
  const additionalProfiles = clampedCount - FAMILY_PRICING.minProfiles;
  return FAMILY_PRICING.basePrice + (additionalProfiles * FAMILY_PRICING.pricePerAdditionalProfile);
};

type PackageType = "single" | "couple" | "family";

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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    const { paymentType, isUpgrade, currentTier, includeUpdateService, familyProfileCount, isAddingProfiles, additionalProfileCount, currentMaxProfiles } = await req.json();
    
    const validTypes = ["single", "couple", "family"];
    if (!paymentType || !validTypes.includes(paymentType)) {
      throw new Error("Invalid payment type. Must be 'single', 'couple', or 'family'");
    }

    // Validate additional profile purchase for existing family users
    if (isAddingProfiles) {
      if (paymentType !== "family") {
        throw new Error("Adding profiles is only available for family package");
      }
      if (!additionalProfileCount || additionalProfileCount < 1) {
        throw new Error("Invalid additional profile count");
      }
      const newTotal = (currentMaxProfiles || 4) + additionalProfileCount;
      if (newTotal > FAMILY_PRICING.maxProfiles) {
        throw new Error(`Maximum ${FAMILY_PRICING.maxProfiles} profiles allowed`);
      }
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
    
    // Calculate the price for the selected package
    const getPackagePrice = (type: string, profileCount?: number): number => {
      if (type === "family") {
        return calculateFamilyPrice(profileCount || FAMILY_PRICING.minProfiles);
      }
      return PACKAGE_PRICES[type as "single" | "couple"];
    };
    
    // Get max profiles for metadata
    const getMaxProfiles = (type: string, profileCount?: number): number => {
      if (type === "family") {
        return Math.max(FAMILY_PRICING.minProfiles, Math.min(FAMILY_PRICING.maxProfiles, profileCount || FAMILY_PRICING.minProfiles));
      }
      return type === "couple" ? 2 : 1;
    };

    const selectedMaxProfiles = isAddingProfiles 
      ? (currentMaxProfiles || 4) + additionalProfileCount
      : getMaxProfiles(paymentType, familyProfileCount);
    const packagePrice = getPackagePrice(paymentType, familyProfileCount);

    if (isAddingProfiles) {
      // Adding profiles to existing family package
      const addProfilesAmount = additionalProfileCount * FAMILY_PRICING.pricePerAdditionalProfile;
      
      const addProfilesPrice = await stripe.prices.create({
        unit_amount: addProfilesAmount,
        currency: "eur",
        product_data: {
          name: `${additionalProfileCount} zusätzliche Familien-Profile`,
        },
      });

      lineItems.push({
        price: addProfilesPrice.id,
        quantity: 1,
      });
    } else if (isUpgrade && currentTier && validTypes.includes(currentTier)) {
      // Calculate upgrade price
      const currentPrice = getPackagePrice(currentTier);
      const upgradeAmount = packagePrice - currentPrice;

      if (upgradeAmount <= 0) {
        throw new Error("Invalid upgrade: new package must be more expensive");
      }

      // Create a price for the upgrade amount
      const upgradePrice = await stripe.prices.create({
        unit_amount: upgradeAmount,
        currency: "eur",
        product_data: {
          name: `Upgrade von ${currentTier} zu ${paymentType}${paymentType === "family" ? ` (${selectedMaxProfiles} Profile)` : ""}`,
        },
      });

      lineItems.push({
        price: upgradePrice.id,
        quantity: 1,
      });
    } else {
      // Regular purchase - create dynamic price for family, use fixed for others
      if (paymentType === "family") {
        const dynamicPrice = await stripe.prices.create({
          unit_amount: packagePrice,
          currency: "eur",
          product_data: {
            name: `Familien-Paket (${selectedMaxProfiles} Profile)`,
          },
        });
        lineItems.push({
          price: dynamicPrice.id,
          quantity: 1,
        });
      } else {
        lineItems.push({
          price: PRICES[paymentType as "single" | "couple"],
          quantity: 1,
        });
      }
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
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=${paymentType}${isUpgrade ? "&upgrade=true" : ""}${isAddingProfiles ? "&add_profiles=true" : ""}&profiles=${selectedMaxProfiles}`,
      cancel_url: `${req.headers.get("origin")}/dashboard`,
      metadata: {
        user_id: user.id,
        payment_type: paymentType,
        is_upgrade: isUpgrade ? "true" : "false",
        is_adding_profiles: isAddingProfiles ? "true" : "false",
        max_profiles: String(selectedMaxProfiles),
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
          max_profiles: String(selectedMaxProfiles),
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    // Return generic error message to prevent information leakage
    console.error("Payment error occurred");
    return new Response(JSON.stringify({ error: "Payment processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});