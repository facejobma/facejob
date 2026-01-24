"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthenticatedUser, redirectToLogin, UserRole } from "@/lib/auth";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getAuthenticatedUser();
        
        if (!user) {
          // User is not authenticated
          redirectToLogin();
          return;
        }

        // Check role authorization
        let authorized = true;
        
        if (requiredRole) {
          authorized = user.role === requiredRole;
        } else if (allowedRoles && allowedRoles.length > 0) {
          authorized = allowedRoles.includes(user.role);
        }

        if (!authorized) {
          // User doesn't have the required role, redirect to their appropriate dashboard
          switch (user.role) {
            case 'candidat':
              router.push('/dashboard/candidat');
              break;
            case 'entreprise':
              router.push('/dashboard/entreprise');
              break;
            case 'admin':
              router.push('/dashboard/admin');
              break;
            default:
              redirectToLogin();
          }
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        redirectToLogin();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect, so don't render anything
  }

  return <>{children}</>;
};

export default RouteGuard;