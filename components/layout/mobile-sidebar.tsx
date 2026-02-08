"use client";
import { DashboardNav } from "@/components/dashboard-nav";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { navItemsCandidat } from "@/constants/data";
import { navItemsEntreprise } from "@/constants/data";
import { MenuIcon, X } from "lucide-react";
import { useState } from "react";

// import { Playlist } from "../data/playlists";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  // playlists: Playlist[];
}

export function MobileSidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const userRole =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("userRole")
      : null;

  const userData = 
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;
  
  const user = userData ? JSON.parse(userData) : null;

  const navItems =
    userRole === "entreprise" ? navItemsEntreprise : navItemsCandidat;

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MenuIcon className="h-6 w-6 text-gray-700" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="!px-0 w-80">
          <div className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </div>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>



            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4">
                <h3 className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Navigation
                </h3>
                <DashboardNav items={navItems} setOpen={setOpen} closeOnClick={false} />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
