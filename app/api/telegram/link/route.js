import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.TELEGRAM_INTERNAL_TOKEN}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { supabase_user_id, telegram_user_id, telegram_username } = payload;

  if (!supabase_user_id || !telegram_user_id) {
    return NextResponse.json(
      { error: "supabase_user_id et telegram_user_id sont obligatoires" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .upsert(
      {
        id: supabase_user_id,
        telegram_id: telegram_user_id,
        telegram_username: telegram_username || null,
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Erreur update user_profiles (telegram link):", error);
    return NextResponse.json({ error: "Supabase error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: data }, { status: 200 });
}
