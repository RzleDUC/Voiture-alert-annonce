export default function ProjectInfoCard() {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 text-sm md:text-base">
      <h2 className="text-lg md:text-xl font-semibold mb-3">
        À propos du projet
      </h2>

      <ul className="space-y-2 text-slate-300">
        <li>
          ✅ <span className="font-semibold">Objectif :</span> apprendre à
          construire une vraie web app (frontend, backend, automatisation,
          sécurité, déploiement).
        </li>
        <li>
          🧠 <span className="font-semibold">Stack :</span> Next.js, React,
          TailwindCSS, Supabase, n8n, Telegram Bot.
        </li>
        <li>
          🧪 <span className="font-semibold">Usage :</span> projet
          d&apos;entraînement + partage avec 2–3 amis.
        </li>
        <li>
          🔐 <span className="font-semibold">Focus :</span> qualité du code,
          sécurité, et bonnes pratiques (selon ton code review & security
          checklist).
        </li>
      </ul>

      <p className="mt-4 text-xs text-slate-500">
        Version 0.1 — Pour l&apos;instant, on met en place l&apos;interface et
        la structure. Ensuite viendront l&apos;auth Telegram, les filtres,
        Supabase et n8n.
      </p>
    </section>
  );
}
