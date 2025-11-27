"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  carCatalog,
  wilayas,
  engineTypes,
  gearboxTypes,
  conditionOptions,
  exchangeOptions,
} from "@/data/carCatalog";

const STORAGE_KEY = "va.savedModels";
const MAX_FREE_CARDS = 2;
const MIN_YEAR = 1935;
const MAX_YEAR = new Date().getFullYear() + 2;
const inputClass =
  "text-sm bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 " +
  "dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50 dark:placeholder:text-slate-400";

const emptyCard = () => ({
  id: crypto.randomUUID(),
  marque: "",
  modele: "",
  wilaya: "",
  prixMin: "",
  prixMax: "",
  anneeMin: "",
  anneeMax: "",
  engine: "",
  condition: "",
  exchange: "",
  fuel: "",
  gearbox: "",
  showAdvanced: false,
  errors: {},
});

function validateCard(card) {
  const errors = {};

  if (!card.marque) errors.marque = "La marque est obligatoire.";
  if (!card.modele) errors.modele = "Le modèle est obligatoire.";
  if (!card.wilaya) errors.wilaya = "La wilaya est obligatoire.";

  if (!card.prixMin || !card.prixMax) {
    errors.prix = "Prix min et max sont obligatoires.";
  } else {
    const min = Number(card.prixMin);
    const max = Number(card.prixMax);
    if (Number.isNaN(min) || Number.isNaN(max) || min <= 0 || max <= 0) {
      errors.prix = "Les prix doivent être des nombres positifs.";
    } else if (min > max) {
      errors.prix = "Le prix minimum doit être ≤ au prix maximum.";
    }
  }

  if (!card.anneeMin || !card.anneeMax) {
    errors.annee = "Année min et max sont obligatoires.";
  } else {
    const min = Number(card.anneeMin);
    const max = Number(card.anneeMax);
    if (
      Number.isNaN(min) ||
      Number.isNaN(max) ||
      min < MIN_YEAR ||
      max > MAX_YEAR
    ) {
      errors.annee = `Les années doivent être entre ${MIN_YEAR} et ${MAX_YEAR}.`;
    } else if (min > max) {
      errors.annee = "L'année minimum doit être ≤ à l'année maximum.";
    }
  }

  return errors;
}

export default function FiltersForm() {
  const [cards, setCards] = useState([emptyCard()]);
  const [saveMessage, setSaveMessage] = useState("");

  // Charger depuis localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const restored = parsed.map((p) => ({
          ...emptyCard(),
          ...p,
          errors: {},
        }));
        setCards(restored);
      }
    } catch {
      // ignore
    }
  }, []);

  const allMakes = useMemo(
    () => Object.keys(carCatalog).sort((a, b) => a.localeCompare(b)),
    []
  );

  const handleChange = (cardId, field, value) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              [field]: value,
              ...(field === "marque"
                ? {
                    modele: "",
                  }
                : {}),
            }
          : c
      )
    );
  };

  const handleReset = (cardId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...emptyCard(), id: c.id } : c))
    );
  };

  const handleDeleteCard = (cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw).filter((c) => c.id !== cardId);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
    }
  };

  const handleAddCard = () => {
    if (cards.length >= MAX_FREE_CARDS) {
      alert(
        "Fonctionnalité PRO : tu as déjà 2 modèles à suivre.\nMets à niveau ton plan pour suivre plus de modèles."
      );
      return;
    }
    setCards((prev) => [...prev, emptyCard()]);
  };

  const handleSave = (cardId) => {
    setCards((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== cardId) return c;
        const errors = validateCard(c);
        return { ...c, errors };
      });

      const current = updated.find((c) => c.id === cardId);
      if (!current) return updated;
      if (Object.keys(current.errors).length > 0) {
        setSaveMessage("");
        return updated;
      }

      const toSave = updated.map(({ errors, ...rest }) => ({
        ...rest,
      }));

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      }
      setSaveMessage("Filtres enregistrés (localStorage). Backend bientôt 😎");
      setTimeout(() => setSaveMessage(""), 2000);

      return updated;
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* pb-24 = espace pour que les boutons flottants ne recouvrent pas le bas */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Modèles de voitures à suivre
        </h2>
        <div className="flex items-center gap-2">
          {cards.length >= MAX_FREE_CARDS && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
              PRO
            </span>
          )}
          <button
            type="button"
            onClick={handleAddCard}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            title={
              cards.length >= MAX_FREE_CARDS
                ? "Fonctionnalité PRO (plus de 2 modèles)"
                : "Ajouter un modèle à suivre"
            }
          >
            +
          </button>
        </div>
      </div>

      {saveMessage && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded">
          {saveMessage}
        </p>
      )}

      <div className="space-y-4">
        {cards.map((card, idx) => {
          const modelsForMake = card.marque
            ? carCatalog[card.marque] || []
            : [];

          const isAdvancedLocked = idx >= 1; // à partir de la deuxième carte

          const handleToggleAdvanced = () => {
            if (isAdvancedLocked) {
              alert(
                "Recherche avancée PRO : tu peux l'utiliser pour le premier modèle gratuitement.\nPour l'utiliser sur plusieurs modèles, mets ton plan à niveau."
              );
              return;
            }
            handleChange(card.id, "showAdvanced", !card.showAdvanced);
          };

          return (
            <Card
              key={card.id}
              className="border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Configurer mes filtres #{idx + 1}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ces champs décrivent le type de voiture que tu veux
                      surveiller.
                    </p>
                  </div>

                  {cards.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>

                {/* Marque / Modèle / Wilaya */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Marque */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Marque
                    </label>
                    <select
                      value={card.marque}
                      onChange={(e) =>
                        handleChange(card.id, "marque", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50"
                    >
                      <option value="">Choisir une marque</option>
                      {allMakes.map((make) => (
                        <option key={make} value={make}>
                          {make}
                        </option>
                      ))}
                    </select>
                    {card.errors.marque && (
                      <p className="text-xs text-red-600">
                        {card.errors.marque}
                      </p>
                    )}
                  </div>

                  {/* Modèle */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Modèle
                    </label>
                    <select
                      value={card.modele}
                      onChange={(e) =>
                        handleChange(card.id, "modele", e.target.value)
                      }
                      disabled={!card.marque}
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50"
                    >
                      <option value="">
                        {card.marque
                          ? "Choisir un modèle"
                          : "Choisir d'abord une marque"}
                      </option>
                      {modelsForMake.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                    {card.errors.modele && (
                      <p className="text-xs text-red-600">
                        {card.errors.modele}
                      </p>
                    )}
                  </div>

                  {/* Wilaya */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Wilaya
                    </label>
                    <select
                      value={card.wilaya}
                      onChange={(e) =>
                        handleChange(card.id, "wilaya", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50"
                    >
                      <option value="">Choisir une wilaya</option>
                      {wilayas.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                    {card.errors.wilaya && (
                      <p className="text-xs text-red-600">
                        {card.errors.wilaya}
                      </p>
                    )}
                  </div>
                </div>

                {/* Prix & Année */}
                <div className="space-y-3">
                  {/* Prix */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Prix (DA)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min (ex: 230 pour 23M)"
                        value={card.prixMin}
                        onChange={(e) =>
                          handleChange(card.id, "prixMin", e.target.value)
                        }
                        className={inputClass}
                      />
                      <span className="text-xs text-slate-500">—</span>
                      <Input
                        type="number"
                        placeholder="Max (ex: 1430 pour 143M)"
                        value={card.prixMax}
                        onChange={(e) =>
                          handleChange(card.id, "prixMax", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                    {card.errors.prix && (
                      <p className="text-xs text-red-600">{card.errors.prix}</p>
                    )}
                  </div>

                  {/* Année */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Année
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={card.anneeMin}
                        onChange={(e) =>
                          handleChange(card.id, "anneeMin", e.target.value)
                        }
                        className={inputClass}
                      />
                      <span className="text-xs text-slate-500">—</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={card.anneeMax}
                        onChange={(e) =>
                          handleChange(card.id, "anneeMax", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                    {card.errors.annee && (
                      <p className="text-xs text-red-600">
                        {card.errors.annee}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Année logique entre {MIN_YEAR} et {MAX_YEAR}. On évite les
                      1700 / 3400 😂
                    </p>
                  </div>
                </div>

                {/* Recherche avancée */}
                <div className="border-t border-slate-200 pt-3 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleToggleAdvanced}
                      className="text-xs px-3 py-1 border-sky-500 text-sky-700 hover:bg-sky-50"
                    >
                      Recherche avancée
                      {isAdvancedLocked && (
                        <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                          PRO
                        </span>
                      )}
                    </Button>
                    <span className="text-[11px] text-slate-400">
                      Optionnelle (affinage Ouedkniss)
                    </span>
                  </div>

                  {card.showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Motorisation */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          Motorisation
                        </label>
                        <select
                          value={card.engine}
                          onChange={(e) =>
                            handleChange(card.id, "engine", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50"
                        >
                          <option value="">Non précisée</option>
                          {engineTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Etat */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          État du véhicule
                        </label>
                        <select
                          value={card.condition}
                          onChange={(e) =>
                            handleChange(card.id, "condition", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50"
                        >
                          <option value="">Non précisé</option>
                          {conditionOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Echange */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          Échange
                        </label>
                        <select
                          value={card.exchange}
                          onChange={(e) =>
                            handleChange(card.id, "exchange", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50"
                        >
                          <option value="">Non précisé</option>
                          {exchangeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Energie */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          Énergie
                        </label>
                        <select
                          value={card.fuel}
                          onChange={(e) =>
                            handleChange(card.id, "fuel", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50"
                        >
                          <option value="">Non précisée</option>
                          {engineTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Boîte */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          Boîte de vitesses
                        </label>
                        <select
                          value={card.gearbox}
                          onChange={(e) =>
                            handleChange(card.id, "gearbox", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-50"
                        >
                          <option value="">Non précisée</option>
                          {gearboxTypes.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={() => handleReset(card.id)}
                  >
                    Réinitialiser
                  </Button>
                  <Button type="button" onClick={() => handleSave(card.id)}>
                    Enregistrer les filtres
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
