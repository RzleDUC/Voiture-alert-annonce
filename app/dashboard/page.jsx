"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeRail, THEME_STORAGE_KEY } from "@/components/layout/ThemeRail";
import FiltersForm from "@/components/dashboard/FiltersForm";
import FaqWidget from "@/components/ui/FaqWidget";
import NotificationBell from "@/components/notifications/NotificationBell";
import AuthStatus from "@/components/auth/AuthStatus";

export default function DashboardPage() {
  const [isDark, setIsDark] = useState(false);

  // Theme
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
                Tableau de bord - Filtres d'annonces
              </h1>
              <p className={`text-sm md:text-base ${headerSubtitle}`}>
                Configure ici les criteres des voitures que tu veux surveiller.
                Plus tard, ces filtres seront utilises par n8n + Telegram pour
                t'envoyer des alertes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <AuthStatus />
            </div>
          </header>

          <section className="px-6 py-6 flex-1">
            <div className="max-w-5xl mx-auto">
              <FiltersForm />
            </div>
          </section>
        </div>

        <ThemeRail isDark={isDark} setIsDark={setIsDark} />
        <FaqWidget isDark={isDark} />
      </div>
    </main>
  );
}
