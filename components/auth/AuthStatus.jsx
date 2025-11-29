// components/auth/AuthStatus.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthStatus() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Retrieve user on load + listen to changes
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (error) {
          console.error("Supabase getUser error:", error);
          setUser(null);
          if (shouldRedirect()) router.replace("/auth");
          return;
        }
        const currentUser = data.user ?? null;
        setUser(currentUser);
        if (!currentUser && shouldRedirect()) {
          router.replace("/auth");
        }
      })
      .catch((err) => {
        console.error("Supabase getUser exception:", err);
        setUser(null);
        if (shouldRedirect()) router.replace("/auth");
      });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (!nextUser && shouldRedirect()) {
          router.replace("/auth");
        }
      }
    );

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signOut error:", err);
    }
    router.replace("/auth");
  };

  const shouldRedirect = () => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    return path.startsWith("/dashboard") || path.startsWith("/profil");
  };

  // If connected: email + logout button
  if (user) {
    return (
      <div className="flex items-center gap-3 text-xs md:text-sm">
        <div className="flex flex-col items-end">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {user.email}
          </span>
          <span className="text-[11px] text-slate-500">
            Connecte (Supabase Auth)
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-2 py-1 rounded-md border border-slate-300 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Se deconnecter
        </button>
      </div>
    );
  }

  // If not connected: simple button to auth page
  return (
    <div className="flex items-center gap-2 text-xs md:text-sm">
      <button
        type="button"
        onClick={() => router.push("/auth")}
        className="px-3 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Se connecter / creer un compte
      </button>
    </div>
  );
}
