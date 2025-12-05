// app/api/n8n/notifications/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TELEGRAM_API = "https://api.telegram.org";

// ---- helpers --------------------------------------------------------

async function getUserProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("id, telegram_id, telegram_username, notify_email, notify_telegram")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Erreur lecture user_profiles:", error);
    return null;
  }
  return data;
}

async function sendTelegramNotification({ profile, title, body, adUrl }) {
  if (!profile) return;
  if (profile.notify_telegram === false) return;
  if (!profile.telegram_id) return;
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("[notif] TELEGRAM_BOT_TOKEN manquant, skip Telegram");
    return;
  }

  const textLines = ["🚗 Nouvelle annonce trouvée !", "", `📰 ${title}`];

  if (body) {
    textLines.push("");
    textLines.push(body);
  }

  if (adUrl) {
    textLines.push("");
    textLines.push(`👉 Voir l'annonce : ${adUrl}`);
  }

  textLines.push("");
  textLines.push("— Envoyé par *Voiture Alert*");

  const text = textLines.join("\n");

  try {
    const res = await fetch(
      `${TELEGRAM_API}/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: profile.telegram_id,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: false,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Erreur sendMessage Telegram:", res.status, errText);
    }
  } catch (e) {
    console.error("Exception sendTelegramNotification:", e);
  }
}

// TODO plus tard : envoyer un email réel via Resend, Mailgun, etc.
async function sendEmailNotification({ profile, title, body, adUrl }) {
  if (!profile) return;
  if (profile.notify_email === false) return;

  console.log("[notif/email] (stub) À implémenter plus tard", {
    user_id: profile.id,
    title,
    body,
    adUrl,
  });
}

// --------------------------------------------------------------------

export async function POST(req) {
  const authHeader = req.headers.get("authorization");

  // Sécurité : n8n (ou un appel interne) doit envoyer Authorization: Bearer N8N_INTERNAL_TOKEN
  if (authHeader !== `Bearer ${process.env.N8N_INTERNAL_TOKEN}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { user_id, filter_id, title, body, ad_url, channel } = payload;

  if (!user_id || !title) {
    return NextResponse.json(
      { error: "user_id et title sont obligatoires" },
      { status: 400 }
    );
  }

  // 1) Créer la notification interne (centre de notifications)
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .insert({
      user_id,
      filter_id: filter_id || null,
      title,
      body: body || null,
      url: ad_url || null,
      channel: channel || "n8n",
    })
    .select()
    .single();

  if (error) {
    console.error("Erreur insert notification n8n:", error);
    return NextResponse.json({ error: "Supabase error" }, { status: 500 });
  }

  // 2) Lire les préférences de l'utilisateur
  const profile = await getUserProfile(user_id);

  // 3) Émettre les canaux externes en fonction des prefs
  await Promise.all([
    sendTelegramNotification({ profile, title, body, adUrl: ad_url }),
    sendEmailNotification({ profile, title, body, adUrl: ad_url }),
  ]);

  return NextResponse.json({ ok: true, notification: data }, { status: 201 });
}
