"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar({ isDark }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isSuivre = pathname === "/suivre-modeles";
  const isProfil = pathname === "/profil";

  const baseItem =
    "w-full block px-3 py-2 rounded-lg text-sm font-medium transition";

  const activeLight = "bg-slate-900 text-white";
  const inactiveLight = "text-slate-800 hover:bg-slate-100";

  const activeDark = "bg-slate-800 text-slate-50";
  const inactiveDark = "text-slate-200 hover:bg-slate-800";

  const active = isDark ? activeDark : activeLight;
  const inactive = isDark ? inactiveDark : inactiveLight;

  const asideClasses = isDark
    ? "w-56 border-r border-slate-800 bg-slate-950/90 px-4 py-6"
    : "w-56 border-r border-slate-200 bg-white px-4 py-6";

  return (
    <aside className={asideClasses}>
      <div className="font-semibold text-lg mb-6">Voiture Alert</div>

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className={`${baseItem} ${isDashboard ? active : inactive}`}
        >
          Dashboard
        </Link>
        <Link
          href="/profil"
          className={`${baseItem} ${isProfil ? active : inactive}`}
        >
          Profil
        </Link>
        <Link
          href="/suivre-modeles"
          className={`${baseItem} ${isSuivre ? active : inactive}`}
        >
          Suivre modeles
        </Link>
      </nav>
    </aside>
  );
}
