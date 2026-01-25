import Cookies from "js-cookie";

// User types
export type UserRole = 'candidat' | 'entreprise' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  [key: string]: any;
}

// Get user data from token by calling the backend
export async function getUserFromToken(): Promise<AuthUser | null> {
  const token = Cookies.get("authToken");
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Token is invalid, clear it
      logout();
      return null;
    }

    const userData = await response.json();
    
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

    return {
      ...userData,
      role
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    logout();
    return null;
  }
}

// Check if user is authenticated and get their role
export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  // First check if we have a token
  const token = Cookies.get("authToken");
  if (!token) {
    return null;
  }

  // Get user data from backend
  return await getUserFromToken();
}

// Redirect user to appropriate dashboard based on their role
export function redirectToDashboard(role: UserRole) {
  switch (role) {
    case 'candidat':
      window.location.href = '/dashboard/candidat';
      break;
    case 'entreprise':
      window.location.href = '/dashboard/entreprise';
      break;
    case 'admin':
      window.location.href = '/dashboard/admin';
      break;
    default:
      window.location.href = '/';
  }
}

// Redirect to appropriate login page based on role
export function redirectToLogin(role?: UserRole) {
  switch (role) {
    case 'candidat':
      window.location.href = '/auth/login-candidate';
      break;
    case 'entreprise':
      window.location.href = '/auth/login-entreprise';
      break;
    default:
      window.location.href = '/auth/login-candidate'; // Default to candidate login
  }
}

export function logout() {
  // Clear all localStorage items
  if (typeof window !== "undefined") {
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
  }
  
  // Get all cookie names and clear them
  const allCookies = document.cookie.split(";");
  
  // Clear all cookies with different path and domain options
  allCookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Clear with default options
    Cookies.remove(name);
    
    // Clear with path options
    Cookies.remove(name, { path: "/" });
    Cookies.remove(name, { path: "/", domain: window.location.hostname });
    Cookies.remove(name, { path: "/", domain: `.${window.location.hostname}` });
  });
  
  // Clear specific known cookies
  const knownCookies = [
    "authToken", "refreshToken", "userRole", "user", "access_token", 
    "user_type", "auth_provider", "next-auth.session-token", 
    "next-auth.callback-url", "next-auth.csrf-token"
  ];
  
  knownCookies.forEach(cookieName => {
    Cookies.remove(cookieName);
    Cookies.remove(cookieName, { path: "/" });
    Cookies.remove(cookieName, { path: "/", domain: window.location.hostname });
    Cookies.remove(cookieName, { path: "/", domain: `.${window.location.hostname}` });
  });
}

export function performLogout(userRole?: string | null) {
  console.log("🚪 Performing logout...");
  
  // Get auth token before clearing
  const authToken = Cookies.get("authToken") || localStorage.getItem("access_token");
  
  // Clear all storage and cookies first
  logout();
  
  // Call backend logout endpoint if we have a token
  if (authToken && process.env.NEXT_PUBLIC_BACKEND_URL) {
    const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + `/api/${apiVersion}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
  }
  
  console.log("✅ Logout completed, redirecting to home page...");
  
  // Redirect to home page
  window.location.href = "/";
}