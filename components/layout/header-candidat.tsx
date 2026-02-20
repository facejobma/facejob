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
            onClick={() => router.push("/dashboard/candidat/postuler")}
          >
            <Video className="w-4 h-4" />
            <span>Créer mon CV vidéo</span>
          </button>
        </div>
        
        <div className={cn("block md:!hidden")}>
          <MobileSidebar />
        </div>
        
        <div className="flex items-center gap-4">
          <Notification />
        </div>
      </nav>
    </div>
  );
}
