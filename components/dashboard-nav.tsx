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
        
        // More precise active detection
        let isActive = false;
        if (item.href) {
          if (path === item.href) {
            // Exact match
            isActive = true;
          } else if (path.startsWith(item.href + '/')) {
            // Sub-page match, but make sure it's not a false positive
            // Check if there's a more specific match in the items
            const currentHref = item.href; // Store in const for type safety
            const hasMoreSpecificMatch = items.some(otherItem => 
              otherItem.href && 
              otherItem.href !== currentHref && 
              otherItem.href.startsWith(currentHref) && 
              (path === otherItem.href || path.startsWith(otherItem.href + '/'))
            );
            isActive = !hasMoreSpecificMatch;
          }
        }
        
        return (
          <Link
            key={index}
            href={item.disabled ? "/" : (item.href || "/")}
            onClick={() => handleItemClick(item)}
            className={cn(
              "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-green-600 text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              item.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <Icon className="h-5 w-5 mr-3" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}