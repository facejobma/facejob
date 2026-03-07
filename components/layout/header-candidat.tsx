"use client";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { Logo } from "@/components/ui/logo";
import Notification from "@/components/layout/Notification";
import { useRouter } from "next/navigation";
import { Video, Menu } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";

export default function HeaderCandidat() {
  const router = useRouter();
  const { toggle } = useSidebar();

  return (
    <div className="fixed top-0 left-0 right-0 border-b bg-white z-40 shadow-sm">
      <nav className="h-16 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-6">
          {/* Mobile Sidebar - Left on mobile */}
          <div className="block md:hidden">
            <div className="bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <MobileSidebar />
            </div>
          </div>

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
          
          {/* CV Video Button - Responsive */}
          <button
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
            onClick={() => router.push("/dashboard/candidat/postuler")}
          >
            <Video className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Créer mon CV vidéo</span>
            <span className="sm:hidden">CV vidéo</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <Notification />
        </div>
      </nav>
    </div>
  );
}
