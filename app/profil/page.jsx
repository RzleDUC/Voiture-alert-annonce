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

export default function ProfilPage() {
  const [isDark, setIsDark] = useState(false);

  // Lecture du theme stocke + application sur <html>
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
  const subtleLabel = isDark ? "text-slate-400" : "text-slate-500";

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
                Gere ton compte, tes parametres Telegram et decouvre les options
                PRO que tu pourras debloquer plus tard.
              </p>
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
                    Ces infos seront liees a ton compte Telegram / alertes.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className={`text-xs ${subtleLabel}`}>Nom affiche</div>
                  <div className="font-medium">Mon super pseudo</div>
                </div>
                <div>
                  <div className={`text-xs ${subtleLabel}`}>Adresse e-mail</div>
                  <div className="font-medium">user@example.com</div>
                </div>
                <div>
                  <div className={`text-xs ${subtleLabel}`}>
                    Statut du compte
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Compte verifie (local)
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
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
                    Parametres pour connecter ton bot Telegram et gerer les
                    alertes.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className={`text-xs ${subtleLabel}`}>
                    @username Telegram
                  </div>
                  <div className="font-medium">@mon_username</div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className={`text-xs ${subtleLabel}`}>
                      Numero (option)
                    </div>
                    <div className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      +213 6X XX XX XX
                    </div>
                  </div>
                </div>
                <div>
                  <div className={`text-xs ${subtleLabel}`}>Frequence</div>
                  <div className="font-medium">
                    1 fois par jour (configuration future)
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm">
                  Mettre a jour Telegram (plus tard)
                </Button>
                <Button variant="outline" size="sm">
                  Mettre fin aux alertes (plus tard)
                </Button>
              </CardFooter>
            </Card>

            {/* Abonnement & PRO */}
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
                      Tu profites du plan gratuit pour demarrer.
                    </p>
                    <ul className="list-disc pl-5 mt-3 space-y-2 text-base">
                      <li>Suivre jusqu&apos;a 2 modeles en parallele.</li>
                      <li>Alertes Telegram basiques (dispo bientot).</li>
                      <li>
                        Configuration sauvegardee en local sur ce navigateur.
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
                        <span>Suivre plusieurs modeles (3, 5, 10...).</span>
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
                          frequence, etc.).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 mt-0.5 text-indigo-500" />
                        <span>Priorite sur les nouvelles fonctionnalites.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950"
                >
                  Voir les plans PRO (futur)
                </Button>
                <Button variant="outline" size="sm">
                  Me prevenir quand PRO sort
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
