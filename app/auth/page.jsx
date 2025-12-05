"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function AuthPage() {
  const router = useRouter();

  // "signin" | "signup" | "forgot"
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const isSignin = mode === "signin";
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  const title = isSignin
    ? "Connexion"
    : isSignup
    ? "Créer un compte"
    : "Mot de passe oublié";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMsg("Entre un email valide.");
      setLoading(false);
      return;
    }

    try {
      if (isSignup) {
        if (!cleanPassword || cleanPassword.length < 6) {
          throw new Error(
            "Le mot de passe doit contenir au moins 6 caractères."
          );
        }
        if (cleanPassword !== passwordConfirm.trim()) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            emailRedirectTo: `${SITE_URL}/auth`,
          },
        });

        if (error) {
          // Gestion explicite de l'email déjà utilisé
          if (
            error.code === "user_already_registered" ||
            error.message?.toLowerCase?.().includes("already registered")
          ) {
            throw new Error(
              "Cet email est déjà utilisé. Connecte-toi ou utilise un autre email."
            );
          }
          throw error;
        }

        // En mode confirmation email activée, data.session est null.
        setInfoMsg(
          "Compte créé. Vérifie ta boite email et clique sur le lien de confirmation avant de te connecter."
        );
        setMode("signin");
        setPassword("");
        setPasswordConfirm("");
        return;
      }

      if (isSignin) {
        if (!cleanPassword) {
          throw new Error("Merci de saisir ton mot de passe.");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          const msg = error.message?.toLowerCase?.() || "";

          if (msg.includes("invalid login")) {
            throw new Error(
              "Email ou mot de passe incorrect. Vérifie tes identifiants."
            );
          }
          if (msg.includes("email not confirmed")) {
            throw new Error(
              "Ton email n'est pas encore confirmé. Vérifie ta boite mail ou tes spams."
            );
          }

          throw error;
        }

        if (!data.session) {
          throw new Error(
            "Connexion impossible (pas de session). Réessaie dans un instant."
          );
        }

        router.push("/dashboard");
        return;
      }

      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: `${SITE_URL}/auth/reset-password`,
          }
        );

        if (error) throw error;

        setInfoMsg(
          "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé."
        );
        setMode("signin");
        setPassword("");
        setPasswordConfirm("");
        return;
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "Erreur d'authentification.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>

        <p className="text-sm text-slate-600 mb-4">
          Utilise ton email et un mot de passe pour accéder à Voiture Alert. Les
          alertes seront ensuite envoyées par email, centre de notifications, et
          Telegram.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password & Confirm (pas pour forgot) */}
          {!isForgot && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {isSignup && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirme le mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          {/* Messages */}
          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">
              {errorMsg}
            </p>
          )}
          {infoMsg && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
              {infoMsg}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 text-white text-sm py-2 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Chargement..." : title}
          </button>
        </form>

        {/* Telegram info (explication, pas login provider pour l'instant) */}
        <div className="mt-4">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-md bg-[#229ED9] text-white text-sm py-2 hover:bg-[#1c86b8]"
            onClick={() => {
              alert(
                "Après la création de ton compte et la confirmation de ton email, tu pourras lier ton Telegram dans la page Profil pour recevoir les alertes en temps réel."
              );
            }}
          >
            Continuer avec Telegram (bientôt totalement automatisé)
          </button>
          <p className="mt-2 text-xs text-slate-600">
            Telegram est utilisé pour t&apos;envoyer les annonces en{" "}
            <strong>temps réel</strong>. La liaison se fait depuis ta page
            Profil après la première connexion.
          </p>
        </div>

        {/* Liens de navigation entre modes */}
        <div className="mt-4 text-xs text-slate-600 space-y-1">
          {isSignin && (
            <>
              <p>
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg("");
                    setInfoMsg("");
                    setPassword("");
                    setPasswordConfirm("");
                  }}
                  className="text-sky-600 hover:underline"
                >
                  Créer un compte
                </button>
              </p>
              <p>
                Mot de passe oublié ?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setErrorMsg("");
                    setInfoMsg("");
                    setPassword("");
                    setPasswordConfirm("");
                  }}
                  className="text-sky-600 hover:underline"
                >
                  Réinitialiser
                </button>
              </p>
            </>
          )}

          {isSignup && (
            <p>
              Tu as déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                  setInfoMsg("");
                  setPassword("");
                  setPasswordConfirm("");
                }}
                className="text-sky-600 hover:underline"
              >
                Se connecter
              </button>
            </p>
          )}

          {isForgot && (
            <p>
              Tu te souviens de ton mot de passe ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                  setInfoMsg("");
                  setPassword("");
                  setPasswordConfirm("");
                }}
                className="text-sky-600 hover:underline"
              >
                Revenir à la connexion
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
