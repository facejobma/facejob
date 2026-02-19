import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// User types
export type UserRole = 'candidat' | 'entreprise' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  [key: string]: any;
}

// Cache pour éviter les appels répétés
const userCache = new Map<string, { user: AuthUser | null; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 secondes

async function getUserFromToken(token: string): Promise<AuthUser | null> {
  // Vérifier le cache d'abord
  const cached = userCache.get(token);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('[ServerAuthGuard] Using cached user data');
    return cached.user;
  }

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`;
    console.log('[ServerAuthGuard] Fetching user from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      next: { revalidate: 30 }, // Revalidate every 30 seconds
    });

    console.log('[ServerAuthGuard] Response status:', response.status);

    if (!response.ok) {
      console.error('[ServerAuthGuard] Failed to fetch user:', response.status, response.statusText);
      return null;
    }

    const userData = await response.json();
    console.log('[ServerAuthGuard] User data received:', { email: userData.email, hasTokenCan: !!userData.tokenCan });
    
    // Determine user role from the token abilities or user type
    let role: UserRole;
    if (userData.tokenCan && userData.tokenCan('role:candidat')) {
      role = 'candidat';
    } else if (userData.tokenCan && userData.tokenCan('role:entreprise')) {
      role = 'entreprise';
    } else if (userData.tokenCan && userData.tokenCan('role:admin')) {
      role = 'admin';
    } else {
      // Fallback: try to determine from user data structure
      if (userData.company_name || userData.sector_id) {
        role = 'entreprise';
      } else if (userData.first_name || userData.last_name) {
        role = 'candidat';
      } else {
        role = 'candidat'; // Default fallback
      }
    }

    console.log('[ServerAuthGuard] Determined role:', role);

    const user = {
      ...userData,
      role
    };

    // Mettre en cache le résultat
    userCache.set(token, { user, timestamp: Date.now() });

    return user;
  } catch (error) {
    console.error('[ServerAuthGuard] Error fetching user data:', error);
    // Mettre en cache l'échec aussi pour éviter les appels répétés
    userCache.set(token, { user: null, timestamp: Date.now() });
    return null;
  }
}

function getDefaultDashboard(role: UserRole): string {
  switch (role) {
    case 'candidat':
      return '/dashboard/candidat';
    case 'entreprise':
      return '/dashboard/entreprise';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/';
  }
}

function getDefaultLogin(requiredRole?: UserRole): string {
  switch (requiredRole) {
    case 'entreprise':
      return '/auth/login-entreprise';
    case 'candidat':
      return '/auth/login-candidate';
    default:
      return '/auth/login-candidate'; // Default to candidate login
  }
}

interface ServerAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export default async function ServerAuthGuard({ 
  children, 
  requiredRole, 
  allowedRoles 
}: ServerAuthGuardProps) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken')?.value;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : 'server';

  console.log('[ServerAuthGuard] Path:', currentPath, '| Token exists:', !!authToken, '| Required role:', requiredRole);

  if (!authToken) {
    // No token, redirect to login
    const loginUrl = getDefaultLogin(requiredRole);
    console.log('[ServerAuthGuard] No token, redirecting to:', loginUrl);
    redirect(loginUrl);
  }

  // Verify token and get user data
  const user = await getUserFromToken(authToken);
  
  console.log('[ServerAuthGuard] User fetched:', user ? `${user.email} (${user.role})` : 'null');
  
  if (!user) {
    // Invalid token, redirect to login
    const loginUrl = getDefaultLogin(requiredRole);
    console.log('[ServerAuthGuard] Invalid token, redirecting to:', loginUrl);
    redirect(loginUrl);
  }

  // Check role authorization
  let authorized = true;
  
  if (requiredRole) {
    authorized = user.role === requiredRole;
    console.log('[ServerAuthGuard] Role check:', user.role, '===', requiredRole, '?', authorized);
  } else if (allowedRoles && allowedRoles.length > 0) {
    authorized = allowedRoles.includes(user.role);
    console.log('[ServerAuthGuard] Allowed roles check:', user.role, 'in', allowedRoles, '?', authorized);
  }

  if (!authorized) {
    // User doesn't have the required role, redirect to their appropriate dashboard
    const dashboardUrl = getDefaultDashboard(user.role);
    console.log('[ServerAuthGuard] Wrong role, redirecting to:', dashboardUrl);
    redirect(dashboardUrl);
  }

  console.log('[ServerAuthGuard] ✓ Auth OK, rendering page');

  // User is authorized, render children
  return <>{children}</>;
}