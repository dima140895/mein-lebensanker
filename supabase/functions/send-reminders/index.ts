import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const APP_URL = "https://mein-lebensanker.lovable.app";
const FROM_EMAIL = "Mein Lebensanker <erinnerung@mein-lebensanker.de>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateUnsubscribeUrl(userId: string): string {
  return `${APP_URL}/abmelden?user=${userId}`;
}

function emailFooter(userId: string): string {
  const unsubUrl = generateUnsubscribeUrl(userId);
  return `
    <tr><td style="padding: 30px 25px 20px; border-top: 1px solid #e8e0d4;">
      <p style="margin:0; font-size:11px; color:#999; text-align:center;">
        Du erhältst diese E-Mail, weil du Erinnerungen in Mein Lebensanker aktiviert hast.<br/>
        <a href="${unsubUrl}" style="color:#999; text-decoration:underline;">Erinnerungen abbestellen</a>
      </p>
    </td></tr>`;
}

function wrapEmail(content: string, userId: string): string {
  return `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="margin:0;padding:0;background-color:#faf8f5;font-family:'Inter',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf8f5;padding:30px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr><td style="background-color:#3d6b5e;padding:24px 25px;text-align:center;">
            <span style="font-size:20px;font-weight:600;color:#faf8f5;letter-spacing:0.5px;">⚓ Mein Lebensanker</span>
          </td></tr>
          ${content}
          ${emailFooter(userId)}
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error("Resend error:", res.status, body);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Send failed:", e);
    return false;
  }
}

// REMINDER 1: Daily check-in reminder
async function processDailyCheckinReminders(supabase: ReturnType<typeof createClient>) {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();

  // Get users who have daily reminders enabled and whose time matches (within 30 min window)
  const { data: prefs, error: prefsErr } = await supabase
    .from("reminder_preferences")
    .select("user_id, daily_checkin_time")
    .eq("daily_checkin_enabled", true)
    .eq("email_unsubscribed", false);

  if (prefsErr || !prefs?.length) return;

  const today = now.toISOString().split("T")[0];

  for (const pref of prefs) {
    // Parse time (HH:MM format) - assume CET (UTC+1/+2)
    const [h, m] = pref.daily_checkin_time.split(":").map(Number);
    // Convert CET to UTC (roughly UTC+1 in winter, UTC+2 in summer)
    const utcHour = (h - 1 + 24) % 24; // simplified CET offset
    
    // Check if current time matches (within 30 min window for cron)
    if (Math.abs(currentHour - utcHour) > 0 || currentMinute > 30) continue;

    // Check if user already did check-in today
    const { data: checkins } = await supabase
      .from("symptom_checkins")
      .select("id")
      .eq("user_id", pref.user_id)
      .eq("checkin_datum", today)
      .limit(1);

    if (checkins && checkins.length > 0) continue;

    // Check subscription (must be plus or familie)
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, active_modules")
      .eq("user_id", pref.user_id)
      .eq("status", "active")
      .limit(1)
      .single();

    if (!sub || !["plus", "familie"].includes(sub.plan)) continue;

    // Get user email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", pref.user_id)
      .single();

    if (!profile?.email) continue;

    const name = profile.full_name ? profile.full_name.split(" ")[0] : "";
    const greeting = name ? `Hallo ${name},` : "Hallo,";

    const html = wrapEmail(`
      <tr><td style="padding:30px 25px;">
        <h1 style="margin:0 0 16px;font-size:22px;color:#3d6b5e;font-weight:600;">
          Dein täglicher Check-in wartet ✨
        </h1>
        <p style="margin:0 0 20px;font-size:15px;color:#3a3a3a;line-height:1.6;">
          ${greeting}<br/><br/>
          Nimm dir 60 Sekunden für deinen Verlauf. Jeder Check-in hilft dir, 
          Muster zu erkennen und deinem Arzt wertvolle Informationen zu geben.
        </p>
        <table cellpadding="0" cellspacing="0"><tr><td style="background-color:#3d6b5e;border-radius:8px;padding:14px 28px;">
          <a href="${APP_URL}/dashboard?module=krankheit" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
            Jetzt Check-in machen →
          </a>
        </td></tr></table>
      </td></tr>
    `, pref.user_id);

    await sendEmail(profile.email, "Dein täglicher Check-in wartet — 60 Sekunden für deinen Verlauf", html);
  }
}

// REMINDER 2: Weekly care summary (Sundays at 18:00 CET)
async function processWeeklySummary(supabase: ReturnType<typeof createClient>) {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const hour = now.getUTCHours();
  
  // Sunday 17:00 UTC = 18:00 CET (winter) / 19:00 CEST (summer)
  if (day !== 0 || hour !== 17) return;

  const { data: prefs } = await supabase
    .from("reminder_preferences")
    .select("user_id")
    .eq("weekly_summary_enabled", true)
    .eq("email_unsubscribed", false);

  if (!prefs?.length) return;

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];
  const todayStr = now.toISOString().split("T")[0];

  for (const pref of prefs) {
    // Check subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", pref.user_id)
      .eq("status", "active")
      .limit(1)
      .single();

    if (!sub || !["plus", "familie"].includes(sub.plan)) continue;

    // Get entries this week
    const { data: entries } = await supabase
      .from("pflege_eintraege")
      .select("stimmung, eintrags_datum, person_name")
      .eq("user_id", pref.user_id)
      .gte("eintrags_datum", weekAgoStr)
      .lte("eintrags_datum", todayStr);

    if (!entries || entries.length === 0) continue;

    const avgStimmung = (entries.reduce((s, e) => s + e.stimmung, 0) / entries.length).toFixed(1);
    const stimmungEmojis = ["", "😢", "😕", "😐", "🙂", "😊"];
    const avgIdx = Math.round(Number(avgStimmung));
    const emoji = stimmungEmojis[avgIdx] || "😐";
    
    // Missing days
    const entryDates = new Set(entries.map(e => e.eintrags_datum));
    const missingDays = 7 - entryDates.size;
    const personName = entries[0]?.person_name || "der pflegebedürftigen Person";

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", pref.user_id)
      .single();

    if (!profile?.email) continue;

    const html = wrapEmail(`
      <tr><td style="padding:30px 25px;">
        <h1 style="margin:0 0 16px;font-size:22px;color:#3d6b5e;font-weight:600;">
          Deine Woche im Überblick 📋
        </h1>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
          <tr>
            <td style="background:#f0f7f4;border-radius:8px;padding:16px;text-align:center;width:33%;">
              <div style="font-size:28px;font-weight:700;color:#3d6b5e;">${entries.length}</div>
              <div style="font-size:12px;color:#666;margin-top:4px;">Einträge</div>
            </td>
            <td width="12"></td>
            <td style="background:#f0f7f4;border-radius:8px;padding:16px;text-align:center;width:33%;">
              <div style="font-size:28px;">${emoji}</div>
              <div style="font-size:12px;color:#666;margin-top:4px;">Ø Stimmung</div>
            </td>
            <td width="12"></td>
            <td style="background:${missingDays > 3 ? '#fff5f5' : '#f0f7f4'};border-radius:8px;padding:16px;text-align:center;width:33%;">
              <div style="font-size:28px;font-weight:700;color:${missingDays > 3 ? '#c53030' : '#3d6b5e'};">${missingDays}</div>
              <div style="font-size:12px;color:#666;margin-top:4px;">Fehlende Tage</div>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0;font-size:14px;color:#555;line-height:1.6;">
          ${missingDays > 0 ? `An ${missingDays} Tag${missingDays > 1 ? 'en' : ''} gab es keinen Eintrag für ${personName}. Regelmäßige Einträge helfen dir, den Verlauf besser zu verstehen.` : `Großartig — du hast jeden Tag einen Eintrag gemacht! 🎉`}
        </p>
        <table cellpadding="0" cellspacing="0"><tr><td style="background-color:#3d6b5e;border-radius:8px;padding:14px 28px;">
          <a href="${APP_URL}/dashboard?module=pflege" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
            Zum Pflege-Tagebuch →
          </a>
        </td></tr></table>
      </td></tr>
    `, pref.user_id);

    await sendEmail(profile.email, `Pflege-Woche: ${entries.length} Einträge, Ø Stimmung ${emoji}`, html);
  }
}

// REMINDER 3: Upgrade reminder for Anker customers (30 days after purchase)
async function processUpgradeReminders(supabase: ReturnType<typeof createClient>) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString();

  // Get Anker-only users who purchased > 30 days ago
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("user_id, created_at")
    .eq("plan", "anker")
    .eq("status", "active")
    .lte("created_at", cutoffDate);

  if (!subs?.length) return;

  for (const sub of subs) {
    // Check if already sent
    const { data: sent } = await supabase
      .from("sent_reminders")
      .select("id")
      .eq("user_id", sub.user_id)
      .eq("reminder_type", "upgrade_anker_plus")
      .limit(1);

    if (sent && sent.length > 0) continue;

    // Check unsubscribed
    const { data: pref } = await supabase
      .from("reminder_preferences")
      .select("email_unsubscribed")
      .eq("user_id", sub.user_id)
      .single();

    if (pref?.email_unsubscribed) continue;

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", sub.user_id)
      .single();

    if (!profile?.email) continue;

    const name = profile.full_name ? profile.full_name.split(" ")[0] : "";
    const greeting = name ? `Hallo ${name},` : "Hallo,";

    const html = wrapEmail(`
      <tr><td style="padding:30px 25px;">
        <h1 style="margin:0 0 16px;font-size:22px;color:#3d6b5e;font-weight:600;">
          Wusstest du schon? 💡
        </h1>
        <p style="margin:0 0 20px;font-size:15px;color:#3a3a3a;line-height:1.6;">
          ${greeting}<br/><br/>
          Mit <strong>Anker Plus</strong> begleitest du nicht nur deine Vorsorge — 
          sondern auch Pflege und chronische Erkrankungen.
        </p>
        <ul style="margin:0 0 20px;padding:0 0 0 20px;color:#3a3a3a;font-size:14px;line-height:1.8;">
          <li><strong>Pflege-Begleiter:</strong> Tagebuch, Medikamente & Kalender</li>
          <li><strong>Krankheits-Begleiter:</strong> Symptom-Tracking & Arzt-Berichte</li>
          <li>14 Tage kostenlos testen</li>
        </ul>
        <table cellpadding="0" cellspacing="0"><tr><td style="background-color:#3d6b5e;border-radius:8px;padding:14px 28px;">
          <a href="${APP_URL}/dashboard?module=einstellungen" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
            Anker Plus entdecken →
          </a>
        </td></tr></table>
      </td></tr>
    `, sub.user_id);

    const sent_ok = await sendEmail(profile.email, "Wusstest du? Mit Anker Plus begleitest du auch Pflege und Krankheit", html);
    
    if (sent_ok) {
      await supabase.from("sent_reminders").insert({
        user_id: sub.user_id,
        reminder_type: "upgrade_anker_plus",
      });
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Run all reminder types
    await Promise.allSettled([
      processDailyCheckinReminders(supabase),
      processWeeklySummary(supabase),
      processUpgradeReminders(supabase),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Reminder processing error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
