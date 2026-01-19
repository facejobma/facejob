"use client";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { Logo } from "@/components/ui/logo";
import Notification from "@/components/layout/Notification";
import { useRouter } from "next/navigation";
import { Send, Star } from "lucide-react";
import Link from "next/link";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });


export default function HeaderEntreprise() {
  const router = useRouter();

  return (
    <div
      className={`fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur py-1 z-20 ${inter.className}`}>
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <div className="hidden md:block my-2 mr-40">
            <Logo />
          </div>
          <button
            className="group flex items-center gap-3 px-6 py-3 text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-green-400/20"
            onClick={() => router.push("/dashboard/entreprise/publier")}
          >
            <div className="relative">
              <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </div>
            <span className="font-bold tracking-wide">Publier une offre</span>
            <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/60 transition-colors duration-300"></div>
          </button>

        </div>
        <div className={cn("block md:!hidden")}>
          <MobileSidebar />
        </div>
        <div className="flex items-center gap-10">
          <button
            className="flex items-center gap-2 px-2 py-2 text-sm text-white font-semibold  rounded-md shadow-lg transition duration-300 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800"
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
