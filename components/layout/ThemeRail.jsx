"use client";

import { Moon, Sun } from "lucide-react";

export const THEME_STORAGE_KEY = "va.theme";

export function ThemeRail({ isDark, setIsDark }) {
  const railClasses = isDark
    ? "bg-slate-900/90 border-slate-700"
    : "bg-white/90 border-slate-200";

  const baseBtn =
    "w-11 h-11 rounded-full flex items-center justify-center border transition-colors duration-150";

  const handleSetMode = (nextIsDark) => {
    setIsDark(nextIsDark);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        nextIsDark ? "dark" : "light"
      );
    }
    document.documentElement.classList.toggle("dark", nextIsDark);
  };

  return (
    <div className="fixed right-6 bottom-24 z-20">
      <div
        className={`p-3 rounded-2xl shadow-lg border ${railClasses} flex items-center justify-center`}
      >
        <button
          type="button"
          onClick={() => handleSetMode(!isDark)}
          title={isDark ? "Passer en clair" : "Passer en sombre"}
          aria-pressed={isDark}
          className={
            isDark
              ? `${baseBtn} bg-slate-800 text-slate-50 border-transparent`
              : `${baseBtn} bg-amber-400 text-slate-900 border-transparent`
          }
        >
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
