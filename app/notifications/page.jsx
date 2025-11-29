"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeRail, THEME_STORAGE_KEY } from "@/components/layout/ThemeRail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FaqWidget from "@/components/ui/FaqWidget";
import AuthStatus from "@/components/auth/AuthStatus";
import NotificationBell from "@/components/notifications/NotificationBell";
import { supabase } from "@/lib/supabaseClient";

export default function NotificationsPage() {
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

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

  // Récupérer user.id
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Erreur auth Supabase :", error);
        setUserId(null);
        return;
      }
      const id = data?.user?.id || null;
      setUserId(id);
    });
  }, []);

  // Charger les notifications
  useEffect(() => {
    if (!userId) return;

    async function loadNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement notifications:", error);
        return;
      }

      setNotifications(data || []);
    }

    loadNotifications();
  }, [userId]);

  const handleOpenNotification = async (notif) => {
    // 1) Marquer comme lue si pas encore lue
    if (!notif.read_at && userId) {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notif.id)
        .eq("user_id", userId);

      if (error) {
        console.error("Erreur update read_at:", error);
      } else {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
      }
    }

    // 2) Ouvrir l'annonce ou rediriger vers Suivre-modèles
    if (notif.ad_url) {
      window.open(notif.ad_url, "_blank");
    } else if (notif.filter_id) {
      router.push(`/suivre-modeles?focus=${notif.filter_id}`);
    }
  };

  const mainClasses = isDark
    ? "w-full min-h-screen bg-slate-950 text-slate-50"
    : "w-full min-h-screen bg-slate-50 text-slate-900";

  const headerBorder = isDark ? "border-slate-800" : "border-slate-200";
  const headerSubtitle = isDark ? "text-slate-400" : "text-slate-600";

  return (
    <main className={mainClasses}>
      <div className="flex min-h-screen">
        <AppSidebar isDark={isDark} />

        <div className="flex-1 flex flex-col">
          <header
            className={`flex items-center justify-between px-6 py-4 border-b ${headerBorder}`}
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Centre de notifications
              </h1>
              <p className={`text-sm md:text-base ${headerSubtitle}`}>
                Toutes les annonces trouvées qui correspondent à tes modèles
                suivis.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <AuthStatus />
            </div>
          </header>

          <section className="px-6 py-6 flex-1">
            <div className="max-w-5xl mx-auto space-y-4 pb-24">
              {notifications.length === 0 && (
                <Card
                  className={
                    isDark
                      ? "p-4 bg-slate-900 border-slate-800"
                      : "p-4 bg-white border-slate-200"
                  }
                >
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Aucune notification pour l&apos;instant. Dès qu&apos;une
                    annonce correspond à tes filtres, elle apparaîtra ici (et
                    sur Telegram si tu l&apos;as connecté).
                  </p>
                </Card>
              )}

              {notifications.map((n) => {
                const isUnread = !n.read_at;
                const created = n.created_at
                  ? new Date(n.created_at).toLocaleString()
                  : "";

                return (
                  <Card
                    key={n.id}
                    className={
                      isDark
                        ? "p-4 bg-slate-900 border-slate-800 flex flex-col gap-3"
                        : "p-4 bg-white border-slate-200 flex flex-col gap-3"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400">{created}</p>
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {n.title || "Nouvelle annonce trouvée"}
                        </h2>
                        {n.body && (
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {n.body}
                          </p>
                        )}
                        {n.channel && (
                          <p className="text-[11px] text-slate-400">
                            Canal : {n.channel}
                          </p>
                        )}
                      </div>

                      {isUnread && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      {n.filter_id && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/suivre-modeles?focus=${n.filter_id}`)
                          }
                        >
                          Voir le modèle suivi
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleOpenNotification(n)}
                      >
                        Voir l&apos;annonce
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>

        <ThemeRail isDark={isDark} setIsDark={setIsDark} />
        <FaqWidget isDark={isDark} />
      </div>
    </main>
  );
}
