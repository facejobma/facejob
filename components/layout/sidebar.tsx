import { DashboardNav } from "@/components/dashboard-nav";
import { navItemsCandidat, navItemsEntreprise } from "@/constants/data";
import { cn } from "@/lib/utils";
import { Star, Video, User, Crown } from "lucide-react";

export default function Sidebar() {
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

  const currentPlan = "Plan Premium";

  return (
    <nav className={cn('relative h-screen border-r pt-20 hidden md:block w-80 bg-gradient-to-b from-green-50 via-white to-emerald-50')}>
      <div className="space-y-6 py-6 px-4 h-full flex flex-col">


        {/* Navigation Section */}
        <div className="flex-1">
          <div className="px-2">
            <h2 className="mb-6 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Navigation
            </h2>
            <DashboardNav items={navItems} />
          </div>
        </div>

        {/* Bottom Section for Enterprise Plan */}
        {userRole === 'entreprise' && (
          <div className="px-6 py-5 bg-gradient-to-br from-green-100 via-emerald-50 to-green-100 rounded-2xl border border-green-200/50 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{currentPlan}</p>
                <p className="text-xs text-gray-600 font-medium">Plan actuel</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

