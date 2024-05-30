"use client";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { UserNav } from "./user-nav";
import { Logo } from "@/components/ui/logo";
import Notification from "@/components/layout/Notification";
import { useRouter } from "next/navigation";
import { Send, Search } from "lucide-react";

export default function Header() {
  const router = useRouter();

  return (
    <div className={`fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur py-1 z-20 font-default`}>
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <div className="hidden lg:block my-2 mr-40">
            <Logo />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 text-white bg-primary hover:bg-primary-1 font-semibold font-default rounded-md shadow-lg transition duration-300"
            onClick={() => router.push("/dashboard/candidat/postuler")}
          >
            <Send className="w-4 h-4" />
            Postuler
          </button>
          <div className="relative flex items-center">
            <input
              type="text"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Search..."
            />
            <Search className="absolute right-2 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center ml-48 gap-10">
            <a
              href="/offres"
              className="text-base font-semibold text-gray-700 hover:text-primary transition duration-300"
            >
              OFFRES
            </a>
            <a
              href="/blogs"
              className="text-base font-semibold text-gray-700 hover:text-primary transition duration-300"
            >
              BLOGS
            </a>
            <a
              href="/support"
              className="text-base font-semibold text-gray-700 hover:text-primary transition duration-300"
            >
              SUPPORT
            </a>
          </div>
        </div>
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar />
        </div>
        <div className="flex items-center gap-5">
          <Notification />
          <UserNav />
        </div>
      </nav>
    </div>
  );
}
