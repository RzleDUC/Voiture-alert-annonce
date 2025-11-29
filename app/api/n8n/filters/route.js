import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Client "admin" (backend ONLY) avec la service_role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/n8n/filters?user_id=...
export async function GET(req) {
  // 1) Récupérer user_id depuis l'URL
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id");

  // 2) Vérifier l'en-tête Authorization
  const authHeader = req.headers.get("authorization");

  // On attend exactement : Authorization: Bearer N8N_INTERNAL_TOKEN
  if (authHeader !== `Bearer ${process.env.N8N_INTERNAL_TOKEN}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: "user_id manquant" }, { status: 400 });
  }

  // 3) Lire les filtres dans Supabase pour ce user_id
  const { data, error } = await supabaseAdmin
    .from("car_filters")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Erreur Supabase n8n:", error);
    return NextResponse.json({ error: "Supabase error" }, { status: 500 });
  }

  // 4) Retourner les filtres en JSON
  return NextResponse.json(data);
}
