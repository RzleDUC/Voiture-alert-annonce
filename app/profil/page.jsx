"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeRail, THEME_STORAGE_KEY } from "@/components/layout/ThemeRail";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FaqWidget from "@/components/ui/FaqWidget";
import {
  BarChart3,
  Crown,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import AuthStatus from "@/components/auth/AuthStatus";
import { supabase } from "@/lib/supabaseClient";
import { getOrCreateUserProfile } from "@/lib/userProfile";

const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

export default function ProfilPage() {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [sendingTelegramTest, setSendingTelegramTest] = useState(false);
  const [telegramTestMessage, setTelegramTestMessage] = useState("");

  // Thème
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const shouldBeDark =
      stored === "dark" || (!stored && prefersDark) ? true : false;

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  // Récupérer l'utilisateur Supabase (email, id)
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (error) {
          console.error("Supabase getUser error:", error);
          setUser(null);
          return;
        }
        setUser(data?.user || null);
      })
      .catch((err) => {
        console.error("Supabase getUser exception:", err);
        setUser(null);
      });
  }, []);

  // Charger / créer le profil user_profiles
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    async function loadProfile() {
      setLoadingProfile(true);
      const { data, error } = await getOrCreateUserProfile(user.id);
      if (error) {
        console.error("Erreur chargement profil:", error);
      }
      if (!cancelled) {
        setProfile(data || null);
        setLoadingProfile(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const mainClasses = isDark
    ? "w-full min-h-screen bg-slate-950 text-slate-50"
    : "w-full min-h-screen bg-slate-50 text-slate-900";

  const headerBorder = isDark ? "border-slate-800" : "border-slate-200";
  const headerSubtitle = isDark ? "text-slate-400" : "text-slate-600";
  const subtleLabel = isDark ? "text-slate-400" : "text-slate-500";

  const telegramConnected = !!profile?.telegram_id;
  const notifyEmail = profile?.notify_email ?? true;
  const notifyTelegram = profile?.notify_telegram ?? true;

  const handleSavePreference = async (field, value) => {
    if (!user?.id || !profile) return;
    setSavingPrefs(true);

    // Optimistic update
    setProfile((prev) => ({ ...prev, [field]: value }));

    const { error } = await supabase
      .from("user_profiles")
      .update({ [field]: value })
      .eq("id", user.id);

    if (error) {
      console.error("Erreur mise à jour préférences:", error);
      // revert
      setProfile((prev) => ({ ...prev, [field]: !value }));
    }

    setSavingPrefs(false);
  };

  const handleToggleEmail = () => {
    handleSavePreference("notify_email", !notifyEmail);
  };

  const handleToggleTelegram = () => {
    handleSavePreference("notify_telegram", !notifyTelegram);
  };

  const handleConnectTelegram = () => {
    if (!user?.id || !TELEGRAM_BOT_USERNAME) return;
    const url = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=connect_${user.id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  async function handleSendTelegramTest() {
    setSendingTelegramTest(true);
    setTelegramTestMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Tu dois etre connecte pour envoyer un test.");
      }

      const res = await fetch("/api/telegram/test-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || "Erreur lors de l'envoi de la notification.");
      }

      setTelegramTestMessage(
        "✅ Notification de test envoyée. Vérifie ton Telegram !"
      );
    } catch (err) {
      console.error("Erreur test Telegram:", err);
      setTelegramTestMessage(
        err.message || "Erreur lors de l'envoi de la notification."
      );
    } finally {
      setSendingTelegramTest(false);
    }
  }

  return (
    <main className={mainClasses}>
      <div className="flex min-h-screen">
        <AppSidebar isDark={isDark} />

        <div className="flex-1 flex flex-col">
          <header
            className={`flex items-center justify-between px-6 py-4 border-b ${headerBorder}`}
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Profil</h1>
              <p className={`text-sm md:text-base ${headerSubtitle}`}>
                Gère ton compte, connecte Telegram et choisis comment tu veux
                recevoir tes alertes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <AuthStatus />
            </div>
          </header>

          <section className="px-6 py-6 grid gap-4 md:grid-cols-2">
            {/* Infos compte */}
            <Card
              className={`md:col-span-1 ${
                isDark
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <CardHeader className="flex flex-row items-center gap-2">
                <User className="w-5 h-5" />
                <div>
                  <CardTitle>Informations du compte</CardTitle>
                  <CardDescription
                    className={isDark ? "text-slate-400" : "text-slate-600"}
                  >
                    Ces infos sont liées à ton compte Supabase.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className={`text-xs ${subtleLabel}`}>Nom affiché</div>
                  <div className="font-medium">
                    {user?.user_metadata?.full_name || "Mon super pseudo"}
                  </div>
                </div>
                <div>
                  <div className={`text-xs ${subtleLabel}`}>Adresse e-mail</div>
                  <div className="font-medium">{user?.email || "—"}</div>
                </div>
                <div>
                  <div className={`text-xs ${subtleLabel}`}>
                    Statut du compte
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Compte actif
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" disabled>
                  Modifier le profil (plus tard)
                </Button>
              </CardFooter>
            </Card>

            {/* Telegram & notifications */}
            <Card
              className={
                isDark
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-white border-slate-200"
              }
            >
              <CardHeader className="flex flex-row items-center gap-2">
                <Send className="w-5 h-5" />
                <div>
                  <CardTitle>Telegram & notifications</CardTitle>
                  <CardDescription
                    className={isDark ? "text-slate-400" : "text-slate-600"}
                  >
                    Configure comment tu veux recevoir les alertes.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className={`text-xs ${subtleLabel}`}>
                    Statut Telegram
                  </div>
                  {loadingProfile ? (
                    <div className="text-xs text-slate-500">
                      Chargement du profil...
                    </div>
                  ) : telegramConnected ? (
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Connecté à Telegram
                      </span>
                      {profile?.telegram_username && (
                        <span className="text-xs text-slate-500">
                          @{profile.telegram_username}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-200">
                        Non connecté
                      </span>
                      <span className="text-xs text-slate-500">
                        Connecter ton Telegram est fortement recommandé pour
                        recevoir les alertes à la seconde.
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className={`text-xs ${subtleLabel}`}>
                    Canaux de notification
                  </div>

                  <label className="flex items-center gap-2 text-xs md:text-sm">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={handleToggleEmail}
                      className="h-4 w-4 rounded border-slate-400"
                    />
                    <span>
                      Recevoir les notifications par <strong>e-mail</strong>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-xs md:text-sm">
                    <input
                      type="checkbox"
                      checked={notifyTelegram}
                      onChange={handleToggleTelegram}
                      className="h-4 w-4 rounded border-slate-400"
                    />
                    <span>
                      Recevoir les notifications sur <strong>Telegram</strong>{" "}
                      <span className="text-[11px] text-amber-500 font-semibold">
                        (fortement recommandé pour l’alerte en temps réel)
                      </span>
                    </span>
                  </label>

                  {savingPrefs && (
                    <p className="text-[11px] text-slate-400">
                      Sauvegarde des préférences...
                    </p>
                  )}

                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleSendTelegramTest}
                      disabled={
                        sendingTelegramTest ||
                        !profile?.telegram_id ||
                        profile?.notify_telegram === false
                      }
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                    >
                      {sendingTelegramTest
                        ? "Envoi en cours..."
                        : "Envoyer une notification Telegram de test"}
                    </button>

                    {telegramTestMessage && (
                      <p className="text-xs text-slate-600 mt-1">
                        {telegramTestMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className={`text-xs ${subtleLabel}`}>
                    Infos supplémentaires
                  </div>
                  <div className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-xs text-slate-500">
                      Ton numéro n&apos;est pas obligatoire. Telegram suffit
                      pour les alertes.
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConnectTelegram}
                  disabled={!user || !TELEGRAM_BOT_USERNAME}
                >
                  {telegramConnected
                    ? "Reconnecter Telegram"
                    : "Connecter mon Telegram"}
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Déconnecter Telegram (plus tard)
                </Button>
              </CardFooter>
            </Card>

            {/* Abonnement & PRO (inchangé, juste relu) */}
            <Card
              className={`md:col-span-2 ${
                isDark
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <CardHeader className="flex flex-row items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <div>
                  <CardTitle>Abonnement & PRO</CardTitle>
                  <CardDescription
                    className={isDark ? "text-slate-400" : "text-slate-600"}
                  >
                    Fais le point sur ton plan actuel et ce que le PRO ajoutera.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  <div
                    className={
                      isDark
                        ? "rounded-lg border border-slate-800 bg-slate-900/70 p-4"
                        : "rounded-lg border border-slate-200 bg-slate-50 p-4"
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${subtleLabel}`}>
                        Plan actuel
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        GRATUIT
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">
                      Tu profites du plan gratuit pour démarrer.
                    </p>
                    <ul className="list-disc pl-5 mt-3 space-y-2 text-base">
                      <li>Suivre jusqu&apos;à 2 modèles en parallèle.</li>
                      <li>Alertes Telegram basiques (bientôt actives).</li>
                      <li>
                        Configuration sauvegardée dans Supabase + localStorage.
                      </li>
                    </ul>
                  </div>

                  <div
                    className={
                      isDark
                        ? "rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                        : "rounded-lg border border-slate-200 bg-white p-4"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Passer en PRO (prochainement)
                      </span>
                    </div>
                    <p className={`mt-1 ${headerSubtitle}`}>
                      Les options pour automatiser davantage ta veille.
                    </p>
                    <ul className="pl-0 mt-3 space-y-2 text-base">
                      <li className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 mt-0.5 text-amber-500" />
                        <span>Suivre plusieurs modèles (3, 5, 10...).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-4 h-4 mt-0.5 text-sky-500" />
                        <span>
                          Chatbot expert qui analyse une annonce et donne un
                          avis.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart3 className="w-4 h-4 mt-0.5 text-emerald-500" />
                        <span>
                          Historique des alertes et statistiques (prix moyen,
                          fréquence, etc.).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 mt-0.5 text-indigo-500" />
                        <span>Priorité sur les nouvelles fonctionnalités.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950"
                  disabled
                >
                  Voir les plans PRO (futur)
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Me prévenir quand PRO sort
                </Button>
              </CardFooter>
            </Card>
          </section>
        </div>

        <ThemeRail isDark={isDark} setIsDark={setIsDark} />
        <FaqWidget isDark={isDark} />
      </div>
    </main>
  );
}
