"use client";
import { DashboardNav } from "@/components/dashboard-nav";
import { navItemsCandidat, navItemsEntreprise } from "@/constants/data";
import { cn } from "@/lib/utils";
import { Star, Video, User, Crown } from "lucide-react";
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
          }
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    } else {
      // If we have role, also get user data
      const userData = window.sessionStorage?.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data:", e);
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/${user.id}/last`,
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
      'fixed left-0 top-0 h-screen border-r pt-16 hidden md:block bg-white z-30 transition-all duration-300 overflow-hidden',
      isOpen ? 'w-64' : 'w-0 border-r-0'
    )}>
      <div className={cn(
        "space-y-4 py-6 px-3 h-full flex flex-col transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0"
      )}>
        {/* Navigation Section */}
        <div className="flex-1">
          <div className="px-2">
            <h2 className="mb-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              Navigation
            </h2>
            <DashboardNav items={navItems} />
          </div>
        </div>

        {/* Bottom Section for Enterprise Plan */}
        {userRole === 'entreprise' && (
          <div className="mx-2 px-4 py-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{currentPlan}</p>
                <p className="text-xs text-gray-600 whitespace-nowrap">Plan actuel</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

