import { DashboardNav } from "@/components/dashboard-nav";
import { navItemsCandidat } from "@/constants/data";
import { navItemsEntreprise } from "@/constants/data";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const userRole =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("userRole")
      : null;

  const navItems =
    userRole === "entreprise" ? navItemsEntreprise : navItemsCandidat;

  return (
    <nav
      className={cn(`relative hidden h-screen border-r pt-16 lg:block w-72`)}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
              Overview
            </h2>
            <DashboardNav items={navItems} />
          </div>
        </div>
      </div>
    </nav>
  );
}
