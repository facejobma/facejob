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