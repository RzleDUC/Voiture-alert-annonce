// data/carCatalog.js
export const carCatalog = {
  Renault: ["Clio 2", "Clio 3", "Clio 4", "Symbol", "Mégane 3", "Mégane 4"],
  Peugeot: ["206", "207", "208", "301", "308"],
  Volkswagen: ["Golf 5", "Golf 6", "Golf 7", "Polo", "Passat"],
  Hyundai: ["i10", "i20", "i30", "Accent", "Elantra"],
  Seat: ["Ibiza", "Leon", "Arona"],
};

export const wilayas = [
  "Adrar",
  "Chlef",
  "Alger",
  "Blida",
  "Oran",
  "Constantine",
  "Sétif",
];

export const engineTypes = ["Essence", "Diesel", "GPL", "Hybride"];

export const gearboxTypes = ["Manuelle", "Automatique", "Semi-automatique"];

export const conditionOptions = [
  { value: "neuf", label: "Neuve" },
  { value: "occasion", label: "Occasion" },
];

export const exchangeOptions = [
  { value: "no_exchange", label: "Pas d'échange" },
  { value: "accepts_exchange", label: "Accepte l'échange" },
  { value: "exchange_only", label: "Uniquement échange" },
];
