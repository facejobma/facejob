"use client";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { UserNav } from "./user-nav";
import { Logo } from "@/components/ui/logo";
import Notification from "@/components/layout/Notification";
import { useRouter } from "next/navigation";
import { Send, Star } from "lucide-react";
import Link from "next/link";

export default function HeaderEntreprise() {
  const router = useRouter();

  return (
    <div
      className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur py-1 z-20 font-default">
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <div className="hidden lg:block my-2 mr-40">
            <Logo />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 text-white bg-primary hover:bg-primary-1 font-semibold font-default rounded-md shadow-lg transition duration-300"
            onClick={() => router.push("/dashboard/entreprise/publier")}
          >
            <Send className="w-4 h-4" />
            Publier
          </button>
          <div className="hidden lg:flex items-center ml-48 gap-10">
            <Link
              href="/dashboard/entreprise/services"
              className="text-base font-semibold text-gray-700 hover:text-primary transition duration-300"
            >
              SERVICES
            </Link>
            <Link
              href="/blogs"
              className="text-base font-semibold text-gray-700 hover:text-primary transition duration-300"
            >
              BLOGS
            </Link>
            <Link
              href="/dashboard/support"
              className="text-base font-semibold text-gray-700 hover:text-primary transition duration-300"
            >
              SUPPORT
            </Link>
          </div>
        </div>
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar />
        </div>
        <div className="flex items-center gap-10">
          <button
            className="flex items-center gap-2 px-2 py-2 text-sm text-white font-semibold font-default rounded-md shadow-lg transition duration-300 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800"
            onClick={() => router.push("/dashboard/entreprise/services")}
          >
            <Star className="w-4 h-4" />
            Upgrade Plan
          </button>
          <Notification />
          <UserNav />
        </div>
      </nav>
    </div>
  );
}
