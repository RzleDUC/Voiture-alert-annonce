// telegram-bot.js
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

// --- ENV ---
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const internalToken = process.env.TELEGRAM_INTERNAL_TOKEN;
const apiBaseUrl =
  process.env.TELEGRAM_LINK_API_BASE_URL || "http://localhost:3000";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!botToken || !internalToken) {
  console.error(
    "❌ TELEGRAM_BOT_TOKEN ou TELEGRAM_INTERNAL_TOKEN manquant dans .env.local"
  );
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local"
  );
  process.exit(1);
}

// --- Clients ---
const bot = new TelegramBot(botToken, { polling: true });

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

// --- Commande /start pour lier Telegram à un compte ---
bot.onText(/\/start(?:\s+(.*))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const payload = (match && match[1] ? match[1].trim() : "") || "";

  // Exemple: "/start connect_e3733612-21b0-4a01-881c-b1f7e7e3573f"
  if (!payload.startsWith("connect_")) {
    await bot.sendMessage(
      chatId,
      "👋 Bienvenue sur Voiture Alert.\n\nPour lier ton compte, ouvre l'application web et clique sur « Connecter mon Telegram » depuis la page Profil."
    );
    return;
  }

  const supabaseUserId = payload.slice("connect_".length);
  const telegramUserId = msg.from.id;
  const telegramUsername = msg.from.username || null;

  try {
    const res = await fetch(`${apiBaseUrl}/api/telegram/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${internalToken}`,
      },
      body: JSON.stringify({
        supabase_user_id: supabaseUserId,
        telegram_user_id: telegramUserId,
        telegram_username: telegramUsername,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Erreur API /api/telegram/link:", res.status, text);
      await bot.sendMessage(
        chatId,
        "❌ Impossible de lier ton compte Voiture Alert pour l’instant. Réessaie plus tard."
      );
      return;
    }

    await bot.sendMessage(
      chatId,
      "✅ Ton compte Voiture Alert est maintenant lié à ce Telegram.\nTu recevras ici les alertes dès qu'une nouvelle annonce correspond à tes filtres."
    );
  } catch (err) {
    console.error("❌ Erreur liaison Telegram:", err);
    await bot.sendMessage(
      chatId,
      "❌ Erreur lors de la liaison. Réessaie dans quelques instants."
    );
  }
});

// --- Abonnement Supabase aux notifications ---
async function subscribeToNotifications() {
  console.log("📡 Abonnement Supabase aux NOTIFICATIONS…");

  const channel = supabase.channel("telegram-notifications").on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications",
    },
    async (payload) => {
      const notif = payload.new;
      console.log("🔔 Nouvelle notification en base :", notif);

      // 👉 ICI ÉTAIT LE BUG : on utilisait 'profiles' au lieu de 'user_profiles'
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles") // ✅ bon nom de table
        .select("id, telegram_id, notify_telegram")
        .eq("id", notif.user_id)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Erreur lecture profile:", profileError);
        return;
      }

      if (!profile) {
        console.log(
          "ℹ️ Aucun profil pour cet utilisateur, pas d’envoi Telegram."
        );
        return;
      }

      if (!profile.notify_telegram) {
        console.log(
          "ℹ️ L’utilisateur a désactivé notify_telegram, pas d’envoi."
        );
        return;
      }

      if (!profile.telegram_id) {
        console.log("ℹ️ Pas de telegram_id enregistré pour cet utilisateur.");
        return;
      }

      const chatId = profile.telegram_id;

      // Création du texte Telegram
      const title = notif.title || "Nouvelle annonce";
      const body = notif.body || "";
      const url = notif.url || "";

      const message =
        `🚗 Nouvelle annonce trouvée !\n\n` +
        `📣 ${title}\n\n` +
        `${body}\n\n` +
        (url ? `👉 Voir l'annonce : ${url}\n\n` : "") +
        "— Envoyé par Voiture Alert";

      try {
        await bot.sendMessage(chatId, message, {
          disable_web_page_preview: false,
        });
        console.log(
          `📨 Notification Telegram envoyée à ${chatId} pour notif ${notif.id}`
        );
      } catch (err) {
        console.error("❌ Erreur envoi Telegram:", err);
      }
    }
  );

  channel.subscribe((status) => {
    console.log("📶 Status canal Supabase:", status);
  });
}

subscribeToNotifications().catch((err) => {
  console.error("❌ Erreur abonnement Supabase:", err);
});

console.log("🚀 Bot Telegram Voiture Alert démarré (polling)...");
