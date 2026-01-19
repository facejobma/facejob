"use client";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { Logo } from "@/components/ui/logo";
import Notification from "@/components/layout/Notification";
import { useRouter } from "next/navigation";
import { Send, Sparkles, Bell } from "lucide-react";
import Link from "next/link";

export default function HeaderCandidat() {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm z-20 font-default">
      <nav className="h-16 flex items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <MobileSidebar />
          </div>
          
          {/* Logo */}
          <div className="hidden md:block">
            <Logo />
          </div>
          
          {/* CTA Button */}
          <button
            className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            onClick={() => router.push("/dashboard/candidat/postuler")}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Créer mon CV vidéo</span>
            <span className="sm:hidden">CV vidéo</span>
          </button>
        </div>



        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <Notification />
          </div>
        </div>
      </nav>
    </div>
  );
}
