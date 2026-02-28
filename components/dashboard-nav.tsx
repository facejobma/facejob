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
    <nav className={cn("grid items-start gap-1.5", !isOpen && "px-1")}>
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
              "group flex items-center rounded-lg text-sm font-medium transition-all duration-200 relative",
              isOpen ? "px-3 py-2" : "px-2 py-2 justify-center",
              isActive
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md shadow-green-200"
                : "text-gray-700 hover:bg-green-50 hover:text-green-700 hover:shadow-sm",
              item.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200",
              isOpen && "mr-2.5",
              isActive 
                ? "bg-white/20" 
                : "bg-gray-100 group-hover:bg-green-100"
            )}>
              <Icon className={cn(
                "h-4 w-4 transition-all duration-200",
                isActive ? "text-white" : "text-gray-600 group-hover:text-green-600"
              )} />
            </div>
            {isOpen && <span className="font-semibold">{item.title}</span>}
            
            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap min-w-max z-50 pointer-events-none">
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