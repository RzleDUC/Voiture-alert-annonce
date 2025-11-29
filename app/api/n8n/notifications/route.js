import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const authHeader = req.headers.get("authorization");

  // Sécurité : n8n doit envoyer Authorization: Bearer TON_TOKEN
  if (authHeader !== `Bearer ${process.env.N8N_INTERNAL_TOKEN}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { user_id, filter_id, title, body, ad_url, channel } = payload;

  if (!user_id || !title) {
    return NextResponse.json(
      { error: "user_id et title sont obligatoires" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .insert({
      user_id,
      filter_id: filter_id || null,
      title,
      body: body || null,
      ad_url: ad_url || null,
      channel: channel || "n8n",
    })
    .select()
    .single();

  if (error) {
    console.error("Erreur insert notification n8n:", error);
    return NextResponse.json({ error: "Supabase error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, notification: data }, { status: 201 });
}
