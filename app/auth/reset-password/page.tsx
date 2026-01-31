"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPasswordRedirectContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token and actor from query params
    const token = searchParams.get('token');
    let actor = searchParams.get('actor') || 'candidat';
    
    // Convert English terms to French for consistency
    if (actor === 'candidate') {
      actor = 'candidat';
    }
    if (actor === 'enterprise') {
      actor = 'entreprise';
    }
    
    if (token) {
      // Redirect to the proper reset password page with token
      // Email will be fetched securely from the backend using the token
      router.replace(`/auth/reset-password/${token}/${actor}`);
    } else {
      // No token provided, redirect to forgot password
      router.replace(`/auth/${actor}/forget-password`);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection sécurisée en cours...</p>
      </div>
    </div>
  );
};

const ResetPasswordRedirect = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <ResetPasswordRedirectContent />
    </Suspense>
  );
};

export default ResetPasswordRedirect;