"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EntrepriseDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the statistics dashboard page
    router.replace("/dashboard/entreprise/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Redirection...</p>
      </div>
    </div>
  );
}
