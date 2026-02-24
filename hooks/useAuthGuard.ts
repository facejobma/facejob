import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthenticatedUser, type UserRole } from '@/lib/auth';

interface UseAuthGuardOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

interface UseAuthGuardReturn {
  isLoading: boolean;
  isAuthorized: boolean;
  user: any | null;
}

// Global state to prevent multiple simultaneous auth checks
let globalAuthCheck: Promise<any> | null = null;
let globalAuthResult: { user: any | null; timestamp: number } | null = null;
const AUTH_RESULT_CACHE = 5000; // 5 seconds cache

export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const { requiredRole, redirectTo } = options;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const hasChecked = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    // Mark as mounted
    isMounted.current = true;

    // Prevent multiple checks
    if (hasChecked.current) {
      return;
    }
    hasChecked.current = true;

    const checkAuth = async () => {
      try {
        // Use cached result if available and recent
        if (globalAuthResult && Date.now() - globalAuthResult.timestamp < AUTH_RESULT_CACHE) {
          console.log('🔄 Using cached auth guard result');
          const cachedUser = globalAuthResult.user;
          
          if (!isMounted.current) return;
          
          if (!cachedUser) {
            setIsLoading(false);
            setIsAuthorized(false);
            if (redirectTo) {
              router.replace(redirectTo);
            }
            return;
          }

          if (requiredRole && cachedUser.role !== requiredRole) {
            setIsLoading(false);
            setIsAuthorized(false);
            // Redirect to appropriate dashboard
            const dashboardMap: Record<UserRole, string> = {
              candidat: '/dashboard/candidat',
              entreprise: '/dashboard/entreprise',
              admin: '/dashboard/admin',
            };
            const userRole = cachedUser.role as UserRole;
            router.replace(dashboardMap[userRole] || '/');
            return;
          }

          setUser(cachedUser);
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // If there's already a check in progress, wait for it
        if (globalAuthCheck) {
          console.log('⏳ Auth guard check already in progress, waiting...');
          const result = await globalAuthCheck;
          
          if (!isMounted.current) return;
          
          handleAuthResult(result);
          return;
        }

        // Start new auth check
        console.log('🔐 Starting new auth guard check');
        globalAuthCheck = getAuthenticatedUser();
        const result = await globalAuthCheck;
        
        // Cache the result
        globalAuthResult = {
          user: result,
          timestamp: Date.now(),
        };
        globalAuthCheck = null;

        if (!isMounted.current) return;
        
        handleAuthResult(result);
      } catch (error) {
        console.error('❌ Auth guard error:', error);
        globalAuthCheck = null;
        
        if (!isMounted.current) return;
        
        setIsLoading(false);
        setIsAuthorized(false);
        if (redirectTo) {
          router.replace(redirectTo);
        }
      }
    };

    const handleAuthResult = (result: any) => {
      if (!result) {
        setIsLoading(false);
        setIsAuthorized(false);
        if (redirectTo) {
          router.replace(redirectTo);
        }
        return;
      }

      if (requiredRole && result.role !== requiredRole) {
        setIsLoading(false);
        setIsAuthorized(false);
        // Redirect to appropriate dashboard
        const dashboardMap: Record<UserRole, string> = {
          candidat: '/dashboard/candidat',
          entreprise: '/dashboard/entreprise',
          admin: '/dashboard/admin',
        };
        const userRole = result.role as UserRole;
        router.replace(dashboardMap[userRole] || '/');
        return;
      }

      setUser(result);
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();

    return () => {
      isMounted.current = false;
    };
  }, []); // Empty deps - only run once

  return { isLoading, isAuthorized, user };
}
