import ThemeToggle from "@/components/layout/ThemeToggle/theme-toggle";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";
import { UserNav } from "./user-nav";
import { Logo } from "@/components/ui/logo";
import Notification from "@/components/layout/Notification";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur py-1 z-20">
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="hidden lg:block my-2">
          <Logo />
        </div>
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar />
        </div>

        <div className="flex items-center gap-5">
          <Notification />
          <UserNav />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
