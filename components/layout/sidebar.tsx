"use client";
import { DashboardNav } from "@/components/dashboard-nav";
import { navItemsCandidat, navItemsEntreprise } from "@/constants/data";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Sidebar() {
  const [currentPlan, setCurrentPlan] = useState<string>("Chargement...");
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const { isOpen } = useSidebar();

  // Initialize client-side data after mount to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    
    // Try to get userRole from sessionStorage first
    let role = window.sessionStorage?.getItem("userRole");

    // Fallback: try to get user data and determine role from it
    if (!role) {
      const userData = window.sessionStorage?.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          // Check if user object has role property
          if (parsedUser.role) {
            role = parsedUser.role;
            // Store it for next time
            window.sessionStorage.setItem("userRole", parsedUser.role);
          }
          // Fallback: detect from user data structure
          else if (parsedUser.company_name || parsedUser.sector_id) {
            role = "entreprise";
            window.sessionStorage.setItem("userRole", "entreprise");
          } else if (parsedUser.first_name || parsedUser.last_name || parsedUser.job_id !== undefined) {
            role = "candidat";
            window.sessionStorage.setItem("userRole", "candidat");
          } else {
          }
          setUser(parsedUser);
        } catch (e) {
          console.error("❌ Sidebar - Error parsing user data:", e);
        }
      } else {
      }
    } else {
      // If we have role, also get user data
      const userData = window.sessionStorage?.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("❌ Sidebar - Error parsing user data:", e);
        }
      }
    }

    setUserRole(role);
  }, []);

  const navItems =
    userRole === "entreprise" ? navItemsEntreprise : navItemsCandidat;

  // Fetch current plan for entreprise users
  useEffect(() => {
    if (!isClient) return;

    const fetchCurrentPlan = async () => {
      if (userRole !== "entreprise" || !user?.id) {
        setIsLoadingPlan(false);
        return;
      }

      try {
        const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
        const response = await fetch(
          `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/payments/${user.id}/last`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCurrentPlan(data.plan_name || "Plan Standard");
        } else if (response.status === 404) {
          // No payment found
          setCurrentPlan("Aucun plan");
        } else {
          setCurrentPlan("Plan Standard");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        setCurrentPlan("Plan Standard");
      } finally {
        setIsLoadingPlan(false);
      }
    };

    fetchCurrentPlan();
  }, [isClient, userRole, user?.id]);

  return (
    <nav className={cn(
      'fixed left-0 top-16 z-30 hidden h-[calc(100dvh-4rem)] border-r border-slate-200/80 bg-white/95 shadow-[8px_0_30px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-all duration-300 md:block',
      isOpen ? 'w-64' : 'w-20'
    )}>
      <div className={cn(
        "flex h-full flex-col px-3 py-5 transition-opacity duration-300"
      )}>
        {/* Navigation Section */}
        <div className="flex-1">
          <div className={cn("px-2", !isOpen && "px-1")}>
            {isOpen && (
              <div className="mb-3 flex items-center gap-2 px-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                <h2 className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Espace de travail
                </h2>
              </div>
            )}
            <DashboardNav items={navItems} isOpen={isOpen} />
          </div>
        </div>

        {/* Bottom Section for Enterprise Plan */}
        {userRole === 'entreprise' && isOpen && (
          <div className="mx-2 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{isLoadingPlan ? "Chargement..." : currentPlan}</p>
                <p className="whitespace-nowrap text-xs font-medium text-emerald-700">Plan actuel</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

