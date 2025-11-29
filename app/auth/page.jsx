"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // "signin" ou "signup"
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("test1234");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const title = mode === "signin" ? "Connexion" : "Créer un compte";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Compte créé. Vérifie ton email ou connecte-toi.");
        setMode("signin");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        console.log("SESSION :", data.session);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-slate-600 mb-4">
          Utilise un email + mot de passe pour cette phase de test. Ensuite, on
          préparera l’auth Telegram.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 text-white text-sm py-2 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Chargement..." : title}
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-600 flex items-center justify-between">
          <span>
            Mode :{" "}
            <strong>{mode === "signin" ? "Connexion" : "Inscription"}</strong>
          </span>
          <button
            type="button"
            className="text-sky-600 hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin"
              ? "Créer un compte"
              : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </main>
  );
}
