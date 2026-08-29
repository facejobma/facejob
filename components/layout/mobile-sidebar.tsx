"use client";
import { DashboardNav } from "@/components/dashboard-nav";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { navItemsCandidat, navItemsEntreprise } from "@/constants/data";
import { MenuIcon, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: "candidat" | "entreprise";
}

export function MobileSidebar({ className, role }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string | null>(role ?? null);

  useEffect(() => {
    // If role is passed as prop, use it directly (most reliable)
    if (role) {
      setDetectedRole(role);
      return;
    }

    let storedRole = window.sessionStorage?.getItem("userRole");

    if (!storedRole) {
      const userData = window.sessionStorage?.getItem("user");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed.role) {
            storedRole = parsed.role;
          } else if (parsed.company_name || parsed.sector_id) {
            storedRole = "entreprise";
          } else {
            storedRole = "candidat";
          }
          if (storedRole) window.sessionStorage.setItem("userRole", storedRole);
        } catch {}
      }
    }

    setDetectedRole(storedRole);
  }, [role]);

  const navItems =
    detectedRole === "entreprise" ? navItemsEntreprise : navItemsCandidat;

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700" aria-label="Ouvrir le menu">
            <MenuIcon className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(88vw,320px)] !px-0 [&>button]:hidden">
          <div className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </div>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <div className="flex h-10 items-center [&_img]:h-9 [&_img]:w-auto"><Logo /></div>
              <button 
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 py-5">
              <div className="px-3">
                <h3 className="mb-3 px-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Espace candidat
                </h3>
                <DashboardNav items={navItems} setOpen={setOpen} closeOnClick={true} />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
