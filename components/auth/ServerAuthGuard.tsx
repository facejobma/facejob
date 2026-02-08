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

async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`;
    console.log('[ServerAuthGuard] Fetching user from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store', // Don't cache auth requests
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

    return {
      ...userData,
      role
    };
  } catch (error) {
    console.error('[ServerAuthGuard] Error fetching user data:', error);
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

  if (!authToken) {
    // No token, redirect to login
    const loginUrl = getDefaultLogin(requiredRole);
    redirect(loginUrl);
  }

  // Verify token and get user data
  const user = await getUserFromToken(authToken);
  
  if (!user) {
    // Invalid token, redirect to login
    const loginUrl = getDefaultLogin(requiredRole);
    redirect(loginUrl);
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
    const dashboardUrl = getDefaultDashboard(user.role);
    redirect(dashboardUrl);
  }

  // User is authorized, render children
  return <>{children}</>;
}