import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * POST /api/telegram/test-notification
 *
 * Doit être appelé depuis le frontend avec:
 *  - Header Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
 *
 * Étapes :
 *  - vérifie le token → récupère l'utilisateur via supabaseAdmin.auth.getUser()
 *  - lit user_profiles (telegram_id, notify_telegram)
 *  - si OK, envoie un message Telegram de test
 */
export async function POST(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    return NextResponse.json(
      { error: "Accès non autorisé (token manquant)." },
      { status: 401 }
    );
  }

  // 1) Récupérer l'utilisateur à partir du token
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    console.error("Erreur getUser dans test-notification:", userError);
    return NextResponse.json(
      { error: "Utilisateur non authentifié." },
      { status: 401 }
    );
  }

  // 2) Lire son profil pour récupérer telegram_id & notify_telegram
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .select("telegram_id, notify_telegram")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(
      "Erreur lecture user_profiles dans test-notification:",
      profileError
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil." },
      { status: 500 }
    );
  }

  if (!profile?.telegram_id) {
    return NextResponse.json(
      {
        error:
          "Aucun Telegram lié à ce compte. Va dans Profil → Connecter Telegram.",
      },
      { status: 400 }
    );
  }

  if (profile.notify_telegram === false) {
    return NextResponse.json(
      {
        error:
          "Les notifications Telegram sont désactivées pour ce compte. Active l’option dans Profil.",
      },
      { status: 400 }
    );
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN manquant côté serveur.");
    return NextResponse.json(
      { error: "Bot Telegram non configuré côté serveur." },
      { status: 500 }
    );
  }

  // 3) Envoyer le message de test
  const text = [
    "🔔 *Test Voiture Alert*",
    "",
    "Si tu lis ce message, c'est que ta connexion Telegram fonctionne parfaitement ✅",
    "",
    "Tu recevras ici les annonces qui correspondent à tes filtres.",
  ].join("\n");

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: profile.telegram_id,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!tgRes.ok) {
      const bodyText = await tgRes.text();
      console.error(
        "Erreur Telegram sendMessage:",
        tgRes.status,
        bodyText.slice(0, 300)
      );
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message Telegram." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Exception Telegram sendMessage:", err);
    return NextResponse.json(
      { error: "Erreur réseau lors de l'envoi du message Telegram." },
      { status: 502 }
    );
  }
}
