"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types";
import { Dispatch, SetStateAction } from "react";
import { performLogout } from "@/lib/auth";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  closeOnClick?: boolean;
  isOpen?: boolean;
}

export function DashboardNav({ items, setOpen, closeOnClick = true, isOpen = true }: DashboardNavProps) {
  const path = usePathname();

  const userRole =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("userRole")
      : null;

  const handleItemClick = (item: NavItem) => {
    if (item.label === "logout") {
      performLogout(userRole);
      return;
    }
    
    if (setOpen && closeOnClick) {
      setOpen(false);
    }
  };

  if (!items?.length) {
    return null;
  }

  return (
    <nav className={cn("grid items-start gap-1", !isOpen && "px-1")}>
      {items.map((item, index) => {
        const Icon = Icons[item.icon || "arrowRight"];
        
        // More precise active detection
        let isActive = false;
        if (item.href) {
          // Remove query params for comparison
          const itemPath = item.href.split('?')[0];
          const currentPath = path;
          
          if (currentPath === itemPath || currentPath === item.href) {
            // Exact match (with or without query params)
            isActive = true;
          } else if (currentPath.startsWith(itemPath + '/')) {
            // Sub-page match - only if no other item has a more specific match
            const hasMoreSpecificMatch = items.some(otherItem => {
              if (!otherItem.href || otherItem.href === item.href) return false;
              const otherPath = otherItem.href.split('?')[0];
              return otherPath !== itemPath && 
                     otherPath.startsWith(itemPath) && 
                     (currentPath === otherPath || currentPath.startsWith(otherPath + '/'));
            });
            isActive = !hasMoreSpecificMatch;
          }
        }
        
        return (
          <Link
            key={index}
            href={item.disabled ? "/" : (item.href || "/")}
            onClick={() => handleItemClick(item)}
            title={!isOpen ? item.title : undefined}
            className={cn(
              "group relative flex min-h-11 items-center rounded-xl text-sm font-medium transition duration-200",
              isOpen ? "px-2.5 py-1.5" : "justify-center px-2 py-1.5",
              isActive
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800",
              item.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200",
              isOpen && "mr-2.5",
              isActive 
                ? "bg-white/20" 
                : "bg-slate-100 group-hover:bg-white"
            )}>
              <Icon className={cn(
                "h-4 w-4 transition-all duration-200",
                isActive ? "text-white" : "text-slate-500 group-hover:text-emerald-700"
              )} />
            </div>
            {isOpen && <span className="truncate font-semibold">{item.title}</span>}
            
            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <div className="pointer-events-none invisible absolute left-full z-50 ml-3 min-w-max rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                {item.title}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
