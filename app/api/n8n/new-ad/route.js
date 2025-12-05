import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const authHeader = req.headers.get("authorization");

  // 1) Security : check token interne N8N
  if (authHeader !== `Bearer ${process.env.N8N_INTERNAL_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Lecture + validation du payload
  let payload;
  try {
    payload = await req.json();
  } catch (e) {
    console.error("new-ad: JSON invalide reçu:", e);
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { ad_id, marque, modele, wilaya, prix, annee, fuel, gearbox, url } =
    payload || {};

  if (
    !ad_id ||
    !marque ||
    !modele ||
    !wilaya ||
    prix == null ||
    annee == null ||
    !url
  ) {
    return NextResponse.json(
      {
        error: "Champs manquants",
        details: {
          ad_id,
          marque,
          modele,
          wilaya,
          prix,
          annee,
          url,
        },
      },
      { status: 400 }
    );
  }

  const priceValue = Number(prix);
  const yearValue = Number(annee);

  if (Number.isNaN(priceValue) || Number.isNaN(yearValue)) {
    return NextResponse.json(
      { error: "prix ou annee non numériques", prix, annee },
      { status: 400 }
    );
  }

  try {
    // 3) On charge tous les filtres et on filtre en JS
    const { data: filters, error: filtersError } = await supabaseAdmin
      .from("car_filters")
      .select(
        "id, user_id, marque, modele, wilaya, prix_min, prix_max, annee_min, annee_max, fuel, gearbox"
      );

    if (filtersError) {
      console.error("Erreur Supabase SELECT car_filters:", filtersError);
      throw filtersError;
    }

    const matchingFilters = (filters || []).filter((f) => {
      const sameBrand =
        f.marque?.toLowerCase() === String(marque).toLowerCase();
      const sameModel =
        f.modele?.toLowerCase() === String(modele).toLowerCase();
      const sameWilaya =
        f.wilaya?.toLowerCase() === String(wilaya).toLowerCase();

      const priceOk =
        priceValue >= (f.prix_min ?? 0) &&
        priceValue <= (f.prix_max ?? Number.MAX_SAFE_INTEGER);
      const yearOk =
        yearValue >= (f.annee_min ?? 1900) &&
        yearValue <= (f.annee_max ?? 2100);

      const fuelOk =
        !f.fuel || !fuel || f.fuel.toLowerCase() === String(fuel).toLowerCase();

      const gearboxOk =
        !f.gearbox ||
        !gearbox ||
        f.gearbox.toLowerCase() === String(gearbox).toLowerCase();

      return (
        sameBrand &&
        sameModel &&
        sameWilaya &&
        priceOk &&
        yearOk &&
        fuelOk &&
        gearboxOk
      );
    });

    if (!matchingFilters.length) {
      return NextResponse.json(
        {
          ok: true,
          matches: 0,
          message: "Aucun filtre ne correspond",
        },
        { status: 201 }
      );
    }

    // 4) On construit les notifications à insérer
    const notificationsToInsert = matchingFilters
      .filter((f) => !!f.user_id) // sécurité si des filtres anciens n'ont pas de user_id
      .map((f) => ({
        user_id: f.user_id,
        filter_id: f.id,
        title: `📢 Nouvelle annonce : ${marque} ${modele}`,
        body: [
          `Une annonce vient d'être trouvée à ${wilaya}.`,
          `Prix : ${priceValue} M DA`,
          `Année : ${yearValue}`,
          `Carburant : ${fuel || "N/A"}`,
          `Boîte : ${gearbox || "N/A"}`,
        ].join("\n"),
        url,
        channel: "n8n-new-ad",
      }));

    if (!notificationsToInsert.length) {
      return NextResponse.json(
        {
          ok: true,
          matches: 0,
          message: "Filtres trouvés mais aucun user_id à notifier",
        },
        { status: 201 }
      );
    }

    const { data: created, error: insertError } = await supabaseAdmin
      .from("notifications")
      .insert(notificationsToInsert)
      .select();

    if (insertError) {
      console.error("Erreur Supabase INSERT notifications:", insertError);
      throw insertError;
    }

    return NextResponse.json(
      {
        ok: true,
        matches: created?.length || 0,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erreur Supabase new-ad (détail):", err);
    return NextResponse.json(
      {
        error: "Supabase error",
        details: err?.message || err,
      },
      { status: 500 }
    );
  }
}
