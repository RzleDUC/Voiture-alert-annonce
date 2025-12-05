import { supabase } from "@/lib/supabaseClient";

/**
 * Récupère le profil utilisateur, et le crée s'il n'existe pas encore.
 */
export async function getOrCreateUserProfile(userId) {
  if (!userId) {
    return { data: null, error: new Error("userId manquant") };
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Erreur lecture user_profiles:", error);
    return { data: null, error };
  }

  // Si pas de profil → on en crée un avec les valeurs par défaut
  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from("user_profiles")
      .insert({ id: userId })
      .select("*")
      .single();

    if (insertError) {
      console.error("Erreur création user_profiles:", insertError);
      return { data: null, error: insertError };
    }

    return { data: inserted, error: null };
  }

  return { data, error: null };
}
