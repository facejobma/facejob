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
    
    // Clear specific sessionStorage items
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("authToken");
    
    // Clear all sessionStorage
    sessionStorage.clear();
  }
  
  // Clear all cookies
  Cookies.remove("authToken");
  Cookies.remove("refreshToken");
  Cookies.remove("userRole");
  Cookies.remove("user");
  
  // Clear all cookies with different path options
  Cookies.remove("authToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
  Cookies.remove("userRole", { path: "/" });
  Cookies.remove("user", { path: "/" });
  
  // Clear cookies with domain options (if your app uses subdomains)
  if (typeof window !== "undefined") {
    const domain = window.location.hostname;
    Cookies.remove("authToken", { domain });
    Cookies.remove("refreshToken", { domain });
    Cookies.remove("userRole", { domain });
    Cookies.remove("user", { domain });
  }
}

export async function performLogout(userRole?: UserRole) {
  // Call backend logout endpoint
  const authToken = Cookies.get("authToken");
  if (authToken && process.env.NEXT_PUBLIC_BACKEND_URL) {
    try {
      await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Backend logout error:", error);
    }
  }
  
  // Clear all storage and cookies
  logout();
  
  // Redirect to appropriate login page
  redirectToLogin(userRole);
}

// Secure login function that gets role from backend
export async function secureLogin(email: string, password: string, loginType: 'candidate' | 'entreprise') {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/${loginType}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Invalid credentials");
    }

    const userData = await response.json();
    const { token, data } = userData;

    // Store token
    Cookies.set("authToken", token, { expires: 7 });

    // Get user role from backend instead of URL
    const authenticatedUser = await getUserFromToken();
    
    if (!authenticatedUser) {
      throw new Error("Failed to get user data after login");
    }

    // Store user data (but don't store role in sessionStorage - get it from backend)
    sessionStorage.setItem("user", JSON.stringify(data));

    // Redirect to appropriate dashboard based on actual role from backend
    redirectToDashboard(authenticatedUser.role);

    return authenticatedUser;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}