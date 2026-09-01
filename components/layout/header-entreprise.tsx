"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Plus, Sparkles } from "lucide-react";
import { MobileSidebar } from "./mobile-sidebar";
import { Logo } from "@/components/ui/logo";
import Notification from "@/components/layout/Notification";
import { useSidebar } from "@/contexts/SidebarContext";

type EnterpriseUser = { company_name?: string; email?: string };

export default function HeaderEntreprise() {
  const router = useRouter();
  const { toggle } = useSidebar();
  const [user, setUser] = useState<EnterpriseUser | null>(null);

  useEffect(() => {
    try {
      const storedUser = window.sessionStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch { setUser(null); }
  }, []);

  const companyName = user?.company_name || "Mon entreprise";
  const initials = companyName.trim().slice(0, 2).toUpperCase() || "EN";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <nav className="flex h-16 items-center justify-between gap-3 px-3 sm:px-5 md:px-6" aria-label="Navigation entreprise">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="md:hidden"><MobileSidebar role="entreprise" /></div>
          <button type="button" onClick={toggle} className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 md:flex" aria-label="Réduire ou ouvrir le menu latéral"><Menu className="h-5 w-5" /></button>
          <div className="hidden h-10 items-center border-r border-slate-200 pr-4 [&_img]:h-9 [&_img]:w-auto md:flex"><Logo /></div>
          <button type="button" onClick={() => router.push("/dashboard/entreprise/publier")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md sm:px-4"><Plus className="h-4 w-4 shrink-0" /><span className="hidden sm:inline">Publier une offre</span><span className="sm:hidden">Publier</span></button>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button type="button" onClick={() => router.push("/dashboard/entreprise/services")} className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800 lg:flex"><Sparkles className="h-4 w-4" /><span>Améliorer mon plan</span></button>
          <Notification />
          <button type="button" onClick={() => router.push("/dashboard/entreprise/profile")} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2 transition hover:border-emerald-200 hover:bg-emerald-50 sm:pr-3" aria-label="Ouvrir le profil de l'entreprise"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-sm">{initials}</span><span className="hidden max-w-40 text-left sm:block"><span className="block truncate text-xs font-semibold text-slate-800">{companyName}</span><span className="block text-[11px] text-slate-500">Entreprise</span></span></button>
        </div>
      </nav>
    </header>
  );
}
