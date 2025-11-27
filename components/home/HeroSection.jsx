import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg p-6 md:p-8 mb-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-3">Voiture Alert 🚗</h1>

      <p className="text-slate-300 mb-5">
        Projet perso pour suivre automatiquement les nouvelles annonces de
        voitures (ex: Ouedkniss) et recevoir des alertes personnalisées.
        L&apos;objectif est d&apos;apprendre les techs modernes : Next.js,
        Tailwind, Supabase, n8n et Telegram.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold">
          Commencer l&apos;aventure
        </Button>

        <Button
          variant="outline"
          className="flex-1 border-slate-600 hover:border-slate-400 text-slate-100"
        >
          Voir la roadmap du projet
        </Button>
      </div>
    </section>
  );
}
