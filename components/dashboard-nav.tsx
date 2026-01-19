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
}

export function DashboardNav({ items, setOpen, closeOnClick = true }: DashboardNavProps) {
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
    <nav className="grid items-start gap-1">
      {items.map((item, index) => {
        const Icon = Icons[item.icon || "arrowRight"];
        const isActive = path === item.href;
        const isLogout = item.label === "logout";
        
        return (
          item.href && (
            isLogout ? (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className="w-full text-left"
              >
                <span
                  className={cn(
                    "group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden",
                    "hover:bg-red-50 hover:text-red-600 text-gray-600",
                    item.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {/* Icon with enhanced styling */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200",
                    "bg-red-100 text-red-500 group-hover:bg-red-200"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Text with better typography */}
                  <span className="flex-1 font-medium transition-all duration-200">
                    {item.title}
                  </span>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>
                </span>
              </button>
            ) : (
              <Link
                key={index}
                href={item.disabled ? "/" : item.href}
                onClick={() => handleItemClick(item)}
              >
                <span
                  className={cn(
                    "group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                      : "hover:bg-green-50 hover:text-green-700 text-gray-600",
                    item.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full"></div>
                  )}
                  
                  {/* Icon with enhanced styling */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200",
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-600"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Text with better typography */}
                  <span className={cn(
                    "flex-1 font-medium transition-all duration-200",
                    isActive ? "text-white" : ""
                  )}>
                    {item.title}
                  </span>
                  
                  {/* Subtle arrow for active state */}
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                    </div>
                  )}
                  
                  {/* Hover effect overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-200 rounded-xl",
                    !isActive && "from-green-500/5 to-emerald-600/5 group-hover:opacity-100"
                  )}></div>
                </span>
              </Link>
            )
          )
        );
      })}
    </nav>
  );
}
