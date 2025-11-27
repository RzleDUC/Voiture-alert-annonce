"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageCircle, X } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Comment ajouter mon premier modèle de voiture à suivre ?",
    a: "Va dans Dashboard, remplis tous les champs (marque, modèle, wilaya, prix et années), puis clique sur “Enregistrer les filtres”. La carte se transforme en récap et sera utilisée plus tard pour les alertes.",
  },
  {
    q: "Pourquoi tous les champs sont obligatoires ?",
    a: "On a besoin d’un filtre précis pour éviter les faux positifs. Si un champ est vide, on ne sait pas exactement ce que tu cherches, donc le formulaire bloque et affiche un message d’erreur.",
  },
  {
    q: "Comment fonctionne le prix en millions sur Ouedkniss ?",
    a: "Sur Ouedkniss, le prix est souvent indiqué en millions de centimes (ex: 230 signifie 2 300 000 DA). Pour l’instant on saisit juste la valeur telle quelle, et plus tard on convertira automatiquement dans le moteur n8n.",
  },
  {
    q: "Quelle plage d’années est acceptée ?",
    a: "L’année minimum doit être entre 1935 et l’année actuelle+2 (par exemple jusqu’en 2027), et l’année max doit être dans la même plage, avec min ≤ max. Sinon, un message d’erreur apparaît.",
  },
  {
    q: "Pourquoi je ne peux créer que 2 modèles gratuits ?",
    a: "La version gratuite te permet de surveiller jusqu’à 2 modèles. Au-delà, la fonctionnalité passera en mode PRO, avec un badge PRO sur le bouton + et, plus tard, un système d’abonnement.",
  },
  {
    q: "Comment modifier ou supprimer un modèle enregistré ?",
    a: "Une fois les filtres enregistrés, la carte récap s’affiche avec deux icônes : un crayon pour repasser en mode édition, et une corbeille pour supprimer complètement ce modèle.",
  },
  {
    q: "À quoi sert la page “Suivre modèles” ?",
    a: "Elle affichera la liste des modèles que tu as enregistrés, avec leurs filtres. Plus tard, on y ajoutera aussi les annonces trouvées et l’historique des alertes envoyées.",
  },
  {
    q: "Le thème sombre/clair change quoi exactement ?",
    a: "Le switch permet de rendre l’interface plus confortable selon ta préférence. Tout le dashboard, la sidebar, les cartes et le widget FAQ s’adaptent en clair ou en sombre.",
  },
  {
    q: "Est-ce que mes filtres sont déjà connectés à n8n et Telegram ?",
    a: "Pas encore. Pour l’instant, on construit le front et la logique. Dans une prochaine étape, on sauvegardera les filtres (Supabase) et on branchera n8n + Telegram pour envoyer les vraies alertes.",
  },
  {
    q: "Ce bouton FAQ deviendra un vrai chatbot ?",
    a: "Oui, l’idée est d’en faire un assistant intégré qui pourra répondre à tes questions et t’aider à ajuster tes filtres. Pour l’instant, il affiche une FAQ statique de 10 questions maximum pour rester simple.",
  },
];

export default function FaqWidget({ isDark }) {
  const [open, setOpen] = useState(false);

  const btnClasses = isDark
    ? "bg-violet-500 hover:bg-violet-400 text-white shadow-lg"
    : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg";

  const cardClasses = isDark
    ? "bg-slate-900 border-slate-700 text-slate-50"
    : "bg-white border-slate-200 text-slate-900";

  return (
    <>
      {/* Bouton flottant */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`fixed right-6 bottom-6 z-30 w-12 h-12 rounded-full flex items-center justify-center ${btnClasses}`}
        title="Aide / FAQ (future chatbot)"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Panneau FAQ */}
      {open && (
        <div className="fixed right-6 bottom-20 z-30 w-80 max-h-[70vh]">
          <Card className={cardClasses}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm">FAQ & guide rapide</CardTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[55vh] overflow-y-auto text-xs">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="font-semibold">• {item.q}</div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {item.a}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
