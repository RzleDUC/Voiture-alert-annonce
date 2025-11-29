"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeRail, THEME_STORAGE_KEY } from "@/components/layout/ThemeRail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FaqWidget from "@/components/ui/FaqWidget";
import AuthStatus from "@/components/auth/AuthStatus";
import { supabase } from "@/lib/supabaseClient";
import NotificationBell from "@/components/notifications/NotificationBell";

const STORAGE_KEY = "va.savedModels";

export default function SuivreModelesPage() {
  const [models, setModels] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [clientId, setClientId] = useState(null);
  const router = useRouter();

  // 1) ThÃ¨me
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

  // 2) Charger ce qu'il y a dans localStorage (pour rÃ©activitÃ© immÃ©diate)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setModels(parsed);
    } catch {
      // ignore
    }
  }, []);

  // 3) Recuperer l'utilisateur Supabase (user.id)
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (error) {
          console.error("Supabase getUser error:", error);
          setClientId(null);
          return;
        }
        setClientId(data?.user?.id || null);
      })
      .catch((err) => {
        console.error("Supabase getUser exception:", err);
        setClientId(null);
      });
  }, []);

  // 4) Quand on connaÃ®t le user.id, charger les filtres depuis Supabase
  useEffect(() => {
    if (!clientId) return;

    async function loadFromSupabase() {
      const { data, error } = await supabase
        .from("car_filters")
        .select("*")
        .eq("user_id", clientId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erreur chargement car_filters depuis Supabase :", error);
        return;
      }

      if (!data) return;

      // On normalise pour qu'il ressemble Ã  ce qu'on stockait dans localStorage
      const normalized = data.map((row) => ({
        id: row.id,
        marque: row.marque || "",
        modele: row.modele || "",
        wilaya: row.wilaya || "",
        prixMin: row.prix_min ?? "",
        prixMax: row.prix_max ?? "",
        anneeMin: row.annee_min ?? "",
        anneeMax: row.annee_max ?? "",
        engine: row.engine || "",
        condition: row.condition || "",
        exchange: row.exchange || "",
        fuel: row.fuel || "",
        gearbox: row.gearbox || "",
      }));

      setModels(normalized);

      // On synchronise aussi localStorage avec la vÃ©ritÃ© de Supabase
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
    }

    loadFromSupabase();
  }, [clientId]);

  const handleDelete = async (id) => {
    // Supprimer cÃ´tÃ© Supabase si possible
    if (clientId) {
      const { error } = await supabase
        .from("car_filters")
        .delete()
        .eq("user_id", clientId)
        .eq("id", id);

      if (error) {
        console.error("Erreur Supabase delete:", error);
      }
    }

    // Mettre Ã  jour l'UI + localStorage
    const next = models.filter((m) => m.id !== id);
    setModels(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const handleEdit = (id) => {
    router.push(`/dashboard?edit=${id}`);
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
              <h1 className="text-2xl md:text-3xl font-bold">Suivre modeles</h1>
              <p className={`text-sm md:text-base ${headerSubtitle}`}>
                Ici tu vois tous les modeles que tu suis depuis le dashboard.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <AuthStatus />
            </div>
          </header>

          <section className="px-6 py-6 flex-1">
            <div className="max-w-5xl mx-auto space-y-4 pb-24">
              {models.length === 0 && (
                <Card
                  className={
                    isDark
                      ? "p-4 bg-slate-900 border-slate-800"
                      : "p-4 bg-white border-slate-200"
                  }
                >
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Aucun modÃ¨le enregistrÃ© pour l&apos;instant. Va sur le{" "}
                    <button
                      type="button"
                      className="text-sky-600 hover:underline"
                      onClick={() => router.push("/dashboard")}
                    >
                      Dashboard
                    </button>{" "}
                    pour configurer ton premier filtre.
                  </p>
                </Card>
              )}

              {models.map((m, idx) => {
                const advanced = [
                  m.engine,
                  m.condition,
                  m.exchange,
                  m.fuel,
                  m.gearbox,
                ]
                  .filter(Boolean)
                  .join(" - ");

                return (
                  <Card
                    key={m.id}
                    className={
                      isDark
                        ? "p-4 bg-slate-900 border-slate-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                        : "p-4 bg-white border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                    }
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">
                        ModÃ¨le #{idx + 1}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {m.marque} {m.modele} - {m.wilaya}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Prix : {m.prixMin}M - {m.prixMax}M &nbsp; | &nbsp; AnnÃ©e
                        : {m.anneeMin}-{m.anneeMax}
                      </p>
                      {advanced && (
                        <p className="text-[11px] text-slate-500">
                          Recherche avancÃ©e : {advanced}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(m.id)}
                      >
                        Modifier
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(m.id)}
                      >
                        Supprimer
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

