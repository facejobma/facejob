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
        'ngrok-skip-browser-warning': 'true',
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

// Auth result interface
export interface AuthResult {
  success: boolean;
  error?: string;
  errorType?: 'validation' | 'credentials' | 'verification' | 'network' | 'server';
}

// Secure login function that handles authentication and role-based redirection
export async function secureLogin(email: string, password: string, expectedRole: "candidate" | "entreprise"): Promise<AuthResult> {
  try {
    const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
    const endpoint = expectedRole === "candidate" 
      ? `/api/${apiVersion}/auth/candidate/login`
      : `/api/${apiVersion}/auth/entreprise/login`;

    const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Determine error type based on status code and message
      let errorType: AuthResult['errorType'] = 'server';
      let errorMessage = "Une erreur s'est produite lors de la connexion";

      if (response.status === 401) {
        errorType = 'credentials';
        errorMessage = "Email ou mot de passe incorrect";
      } else if (response.status === 403) {
        errorType = 'verification';
        errorMessage = "Votre compte doit être vérifié avant de vous connecter";
      } else if (response.status === 422) {
        errorType = 'validation';
        errorMessage = errorData.message || "Données de connexion invalides";
      } else if (response.status >= 500) {
        errorType = 'server';
        errorMessage = "Erreur du serveur, veuillez réessayer plus tard";
      }

      return {
        success: false,
        error: errorMessage,
        errorType
      };
    }

    const data = await response.json();
    
    // Store the auth token
    if (data.access_token) {
      Cookies.set("authToken", data.access_token, { expires: 7 }); // 7 days
    }
    
    // Store user data in session storage
    if (data.user) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
    }
    
    // Determine user role and redirect
    let userRole: UserRole;
    if (expectedRole === "candidate") {
      userRole = "candidat";
    } else {
      userRole = "entreprise";
    }
    
    // Store role for quick access
    Cookies.set("userRole", userRole, { expires: 7 });
    
    // Redirect to appropriate dashboard
    redirectToDashboard(userRole);

    return { success: true };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: "Erreur de connexion, vérifiez votre connexion internet",
      errorType: 'network'
    };
  }
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
        "ngrok-skip-browser-warning": "true",
      },
    });
  }
  
  console.log("✅ Logout completed, redirecting to home page...");
  
  // Redirect to home page
  window.location.href = "/";
}