"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ForgotPasswordRedirect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get actor from query params, default to candidat
    const actor = searchParams.get('actor') || 'candidat';
    
    // Redirect to the proper forgot password page
    router.replace(`/auth/${actor}/forget-password`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default ForgotPasswordRedirect;