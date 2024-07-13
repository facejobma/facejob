"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types";
import { Dispatch, SetStateAction } from "react";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export function DashboardNav({ items, setOpen }: DashboardNavProps) {
  const path = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <nav className="grid items-start gap-2 ">
      {items.map((item, index) => {
        const Icon = Icons[item.icon || "arrowRight"];
        return (
          item.href && (
            <Link
              key={index}
              href={item.disabled ? "/" : item.href}
              onClick={() => {
                if (setOpen) setOpen(false);
              }}
            >
              <span
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-base font-medium transition duration-300 ease-in-out",
                  path === item.href
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                  item.disabled && "cursor-not-allowed opacity-80",
                )}
              >
                <Icon className="mr-2 h-5 w-5" />
                <span className="flex-shrink-0 text-lg font-medium">{item.title}</span>
              </span>
            </Link>
          )
        );
      })}
    </nav>
  );
}
