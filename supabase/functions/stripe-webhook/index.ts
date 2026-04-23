import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const APP_URL = "https://mein-lebensanker.lovable.app";

function log(step: string, details?: unknown) {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` — ${JSON.stringify(details)}` : ""}`);
}

// ── helpers ──────────────────────────────────────────────────────────────

async function findUserByStripeCustomer(customerId: string): Promise<{ userId: string; email: string } | null> {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .limit(1)
    .maybeSingle();

  if (sub?.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", sub.user_id)
      .maybeSingle();

    return { userId: sub.user_id, email: profile?.email || "" };
  }

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    const email = (customer as Stripe.Customer).email;
    if (!email) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (profile?.user_id) {
      return { userId: profile.user_id, email };
    }
  } catch {
    // ignore
  }

  return null;
}

function determinePlan(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price?.id;
  if (priceId === "price_1TFxtdICzkfBNYhyZbGYHWYU") return "familie";
  if (priceId === "price_1TFxtDICzkfBNYhy7DjVuBt7") return "plus";
  return subscription.metadata?.plan || "plus";
}

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

// ── snapshot helpers ────────────────────────────────────────────────────

async function getSubscriptionSnapshot(userId: string): Promise<{
  status: string | null;
  plan: string | null;
  active_modules: string[] | null;
}> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, plan, active_modules")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    status: data?.status ?? null,
    plan: data?.plan ?? null,
    active_modules: data?.active_modules ?? null,
  };
}

async function logWebhookEvent(params: {
  event: Stripe.Event;
  userId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  previous: { status: string | null; plan: string | null; active_modules: string[] | null };
  next: { status: string | null; plan: string | null; active_modules: string[] | null };
  notes?: string;
}) {
  try {
    await supabase.from("stripe_webhook_events").insert({
      stripe_event_id: params.event.id,
      event_type: params.event.type,
      user_id: params.userId,
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.subscriptionId,
      previous_status: params.previous.status,
      new_status: params.next.status,
      previous_plan: params.previous.plan,
      new_plan: params.next.plan,
      previous_active_modules: params.previous.active_modules,
      new_active_modules: params.next.active_modules,
      raw_payload: params.event as unknown as Record<string, unknown>,
      notes: params.notes ?? null,
    });
  } catch (e) {
    log("Failed to persist webhook event log", { error: String(e) });
  }
}

// ── downgrade helper ────────────────────────────────────────────────────

async function downgradeToAnker(userId: string, subscriptionId: string, status: string) {
  log("Downgrading to anker", { userId, status });

  await supabase
    .from("subscriptions")
    .update({
      status,
      active_modules: ["vorsorge"],
      max_profiles: 1,
    })
    .eq("stripe_subscription_id", subscriptionId);

  await supabase
    .from("profiles")
    .update({
      purchased_tier: "anker",
      max_profiles: 1,
    })
    .eq("user_id", userId);
}

// ── send payment-failed email ───────────────────────────────────────────

async function sendPaymentFailedEmail(email: string, _userId: string) {
  if (!RESEND_API_KEY || !email) return;

  const portalUrl = `${APP_URL}/dashboard?module=settings`;

  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="margin:0;padding:0;background-color:#faf8f5;font-family:'Inter',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf8f5;padding:30px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr><td style="background-color:#3d6b5e;padding:24px 25px;text-align:center;">
            <span style="font-size:20px;font-weight:600;color:#faf8f5;letter-spacing:0.5px;">⚓ Mein Lebensanker</span>
          </td></tr>
          <tr><td style="padding:30px 25px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#2C4A3E;font-family:Georgia,serif;">Zahlung fehlgeschlagen</h1>
            <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.6;">
              Leider konnte deine letzte Zahlung für Mein Lebensanker nicht verarbeitet werden. 
              Das kann passieren — zum Beispiel wenn deine Karte abgelaufen ist oder das Limit erreicht wurde.
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
              Bitte aktualisiere deine Zahlungsdaten, damit dein Zugang zu allen Modulen erhalten bleibt.
            </p>
            <div style="text-align:center;">
              <a href="${portalUrl}" style="display:inline-block;padding:12px 28px;background-color:#3d6b5e;color:#faf8f5;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
                Zahlungsdaten aktualisieren →
              </a>
            </div>
            <p style="margin:24px 0 0;font-size:13px;color:#999;line-height:1.5;">
              Falls du Fragen hast, antworte einfach auf diese E-Mail.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Mein Lebensanker <noreply@mein-lebensanker.de>",
        to: [email],
        subject: "Zahlung fehlgeschlagen — bitte aktualisiere deine Zahlungsdaten",
        html,
      }),
    });
    log("Payment failed email sent", { email });
  } catch (e) {
    log("Failed to send payment failed email", { error: String(e) });
  }
}

// ── event handlers ──────────────────────────────────────────────────────

async function handleSubscriptionUpdated(event: Stripe.Event, subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;
  const status = subscription.status;

  log("subscription.updated", { subscriptionId, status });

  const userInfo = await findUserByStripeCustomer(customerId);
  if (!userInfo) {
    log("User not found for customer", { customerId });
    await logWebhookEvent({
      event,
      userId: null,
      customerId,
      subscriptionId,
      previous: { status: null, plan: null, active_modules: null },
      next: { status, plan: determinePlan(subscription), active_modules: null },
      notes: "User not found for customer",
    });
    return;
  }

  const { userId } = userInfo;
  const plan = determinePlan(subscription);
  const previous = await getSubscriptionSnapshot(userId);

  if (status === "active" || status === "trialing") {
    const modules = PLAN_MODULES[plan] || ["vorsorge"];
    const maxProfiles = PLAN_MAX_PROFILES[plan] || 1;

    await supabase
      .from("subscriptions")
      .update({
        status,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        active_modules: modules,
        max_profiles: maxProfiles,
        plan,
      })
      .eq("stripe_subscription_id", subscriptionId);

    await supabase
      .from("profiles")
      .update({
        has_paid: true,
        purchased_tier: plan,
        max_profiles: maxProfiles,
      })
      .eq("user_id", userId);

    log("Subscription active/trialing updated", { userId, plan, status });

    await logWebhookEvent({
      event,
      userId,
      customerId,
      subscriptionId,
      previous,
      next: { status, plan, active_modules: modules },
      notes: "Plan aktiviert/aktualisiert",
    });
  } else if (status === "canceled" || status === "past_due" || status === "unpaid") {
    await downgradeToAnker(userId, subscriptionId, status);
    await logWebhookEvent({
      event,
      userId,
      customerId,
      subscriptionId,
      previous,
      next: { status, plan: "anker", active_modules: ["vorsorge"] },
      notes: `Downgrade auf Anker (Status: ${status})`,
    });
  } else {
    await supabase
      .from("subscriptions")
      .update({ status })
      .eq("stripe_subscription_id", subscriptionId);
    await logWebhookEvent({
      event,
      userId,
      customerId,
      subscriptionId,
      previous,
      next: { status, plan: previous.plan, active_modules: previous.active_modules },
      notes: `Nur Status aktualisiert (${status})`,
    });
  }
}

async function handleSubscriptionDeleted(event: Stripe.Event, subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;

  log("subscription.deleted", { subscriptionId });

  const userInfo = await findUserByStripeCustomer(customerId);
  if (!userInfo) {
    log("User not found for customer", { customerId });
    await logWebhookEvent({
      event,
      userId: null,
      customerId,
      subscriptionId,
      previous: { status: null, plan: null, active_modules: null },
      next: { status: "canceled", plan: "anker", active_modules: ["vorsorge"] },
      notes: "User not found for customer",
    });
    return;
  }

  const previous = await getSubscriptionSnapshot(userInfo.userId);
  await downgradeToAnker(userInfo.userId, subscriptionId, "canceled");
  log("Subscription deleted, downgraded to anker", { userId: userInfo.userId });

  await logWebhookEvent({
    event,
    userId: userInfo.userId,
    customerId,
    subscriptionId,
    previous,
    next: { status: "canceled", plan: "anker", active_modules: ["vorsorge"] },
    notes: "Abo beendet → Downgrade auf Anker",
  });
}

async function handleInvoicePaymentFailed(event: Stripe.Event, invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  log("invoice.payment_failed", { subscriptionId, customerId });

  if (!subscriptionId) return;

  const userInfo = await findUserByStripeCustomer(customerId);
  if (!userInfo) {
    log("User not found for customer", { customerId });
    await logWebhookEvent({
      event,
      userId: null,
      customerId,
      subscriptionId,
      previous: { status: null, plan: null, active_modules: null },
      next: { status: "past_due", plan: null, active_modules: null },
      notes: "User not found for customer",
    });
    return;
  }

  const previous = await getSubscriptionSnapshot(userInfo.userId);

  await supabase
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subscriptionId);

  await sendPaymentFailedEmail(userInfo.email, userInfo.userId);
  log("Invoice payment failed handled", { userId: userInfo.userId });

  await logWebhookEvent({
    event,
    userId: userInfo.userId,
    customerId,
    subscriptionId,
    previous,
    next: { status: "past_due", plan: previous.plan, active_modules: previous.active_modules },
    notes: "Zahlung fehlgeschlagen → Status past_due, E-Mail gesendet",
  });
}

// ── main handler ────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!WEBHOOK_SECRET) {
    log("ERROR: STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    log("Signature verification failed", { error: String(err) });
    return new Response("Invalid signature", { status: 400 });
  }

  log("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event, event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event, event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event, event.data.object as Stripe.Invoice);
        break;
      default:
        log("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    log("Error processing event", { type: event.type, error: String(err) });
    return new Response(JSON.stringify({ received: true, error: "Processing error" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
