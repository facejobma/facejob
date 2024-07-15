import { DashboardNav } from "@/components/dashboard-nav";
import { navItemsCandidat, navItemsEntreprise } from "@/constants/data";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export default function Sidebar() {
  const userRole =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("userRole")
      : null;

  const navItems =
    userRole === "entreprise" ? navItemsEntreprise : navItemsCandidat;

  const currentPlan = "Plan Premium";

  return (
    <nav className={cn('relative hidden h-screen border-r pt-16 pr-12 lg:block w-72')}>
      <div className="space-y-4 py-4 fixed overflow-hidden">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-6 px-4 text-xl font-semibold tracking-tight">
              
            </h2>
            <DashboardNav items={navItems} />
          </div>
        </div>
        {/* {userRole === 'entreprise' && (
          <div className="flex justify-center bottom-0 mt-auto">
            <button
              className="flex items-center gap-2 px-2 py-2 text-sm text-white font-semibold font-default rounded-md shadow-lg transition duration-300 bg-gradient-to-r from-gray-700 to-gray-900 cursor-not-allowed opacity-50"
              disabled
            >
              <Star className="w-4 h-4" />
              {currentPlan} 
            </button>
          </div>
        )} */}
      </div>
    </nav>
  );
}

