"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [validLink, setValidLink] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Vérifier que le lien contient bien un access_token valide
  useEffect(() => {
    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          console.error("Reset password: no valid user/session", error);
          setValidLink(false);
        } else {
          setValidLink(true);
        }
      } catch (err) {
        console.error("Reset password exception:", err);
        setValidLink(false);
      } finally {
        setChecking(false);
      }
    }

    checkSession();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      if (!password || password.length < 6) {
        throw new Error(
          "Le nouveau mot de passe doit contenir au moins 6 caractères."
        );
      }
      if (password !== passwordConfirm) {
        throw new Error("Les mots de passe ne correspondent pas.");
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setInfoMsg("Mot de passe mis à jour avec succès. Redirection...");
      setTimeout(() => {
        router.replace("/auth");
      }, 1500);
    } catch (err) {
      console.error("Reset password error:", err);
      setErrorMsg(
        err.message || "Erreur lors de la mise à jour du mot de passe."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Vérification du lien...</p>
      </main>
    );
  }

  if (!validLink) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold mb-2">
            Lien de réinitialisation invalide ou expiré
          </h1>
          <p className="text-sm text-slate-600 mb-4">
            Merci de refaire une demande de réinitialisation de mot de passe
            depuis la page d&apos;authentification.
          </p>
          <button
            type="button"
            className="w-full rounded-md bg-slate-900 text-white text-sm py-2 hover:bg-slate-800"
            onClick={() => router.replace("/auth")}
          >
            Retourner à la connexion
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-2">Nouveau mot de passe</h1>
        <p className="text-sm text-slate-600 mb-4">
          Choisis un nouveau mot de passe pour ton compte Voiture Alert.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Confirme le mot de passe
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 text-white text-sm py-2 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </div>
    </main>
  );
}
