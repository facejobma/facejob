"use client";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { Logo } from "@/components/ui/logo";
import Notification from "@/components/layout/Notification";
import { useRouter } from "next/navigation";
import { Plus, Star, Menu } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/contexts/SidebarContext";

export default function HeaderEntreprise() {
  const router = useRouter();
  const { toggle } = useSidebar();

  return (
    <div className="fixed top-0 left-0 right-0 border-b bg-white z-40 shadow-sm">
      <nav className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          {/* Toggle Sidebar Button - Desktop */}
          <button
            onClick={toggle}
            className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="hidden md:block">
            <Logo />
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg transition-colors"
            onClick={() => router.push("/dashboard/entreprise/publier")}
          >
            <Plus className="w-4 h-4" />
            <span>Publier une offre</span>
          </button>
        </div>
        
        <div className={cn("block md:!hidden")}>
          <MobileSidebar />
        </div>
        
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
            onClick={() => router.push("/dashboard/entreprise/services")}
          >
            <Star className="w-4 h-4" />
            Mise à niveau
          </button>
          <Notification />
        </div>
      </nav>
    </div>
  );
}
