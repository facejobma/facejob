"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Briefcase, Eye, AlertCircle, Crown } from "lucide-react";
import Link from "next/link";

interface PlanUsage {
  plan_name: string;
  plan_id: number;
  jobs_posted: number;
  jobs_limit: number;
  jobs_remaining: number;
  cv_consumed: number;
  cv_limit: number;
  cv_remaining: number | string;
  plan_active: boolean;
  plan_expired: boolean;
  unlimited_cv_viewing: boolean;
}

export default function PlanUsageBanner() {
  const [usage, setUsage] = useState<PlanUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanUsage = async () => {
      try {
        const userData = sessionStorage.getItem("user");
        if (!userData) return;

        const user = JSON.parse(userData);
        const authToken = Cookies.get("authToken")?.replace(/["']/g, "");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/${user.id}/usage`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error("Error fetching plan usage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanUsage();
  }, []);

  if (loading || !usage) return null;

  const isFreePlan = usage.plan_id === 1;
  const jobsPercentage = usage.jobs_limit > 0 ? (usage.jobs_posted / usage.jobs_limit) * 100 : 0;
  const cvPercentage = usage.cv_limit > 0 ? (usage.cv_consumed / usage.cv_limit) * 100 : 0;
  const isJobLimitReached = usage.jobs_remaining === 0 && usage.jobs_limit > 0;
  const isCvLimitReached = usage.cv_remaining === 0 && usage.cv_limit > 0;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-gray-900">{usage.plan_name}</h3>
            {usage.plan_expired && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                Expiré
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Postings */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Offres d'emploi</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {usage.jobs_posted} / {usage.jobs_limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isJobLimitReached ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(jobsPercentage, 100)}%` }}
                ></div>
              </div>
              {isJobLimitReached && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Limite atteinte
                </p>
              )}
            </div>

            {/* CV Access */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Accès CV</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {usage.cv_consumed} / {usage.cv_limit > 0 ? usage.cv_limit : "∞"}
                </span>
              </div>
              {usage.cv_limit > 0 ? (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCvLimitReached ? "bg-red-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(cvPercentage, 100)}%` }}
                    ></div>
                  </div>
                  {isCvLimitReached && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Limite atteinte
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-green-600 mt-1">Visualisation illimitée</p>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        {(isFreePlan || isJobLimitReached || isCvLimitReached) && (
          <Link
            href="/dashboard/entreprise/services"
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg text-sm transition-all shadow-md hover:shadow-lg whitespace-nowrap"
          >
            {isFreePlan ? "Mettre à niveau" : "Augmenter"}
          </Link>
        )}
      </div>
    </div>
  );
}
