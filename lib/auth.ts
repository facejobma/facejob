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
      // Token is invalid, clear it silently without calling logout
      // This prevents redirect loops - let the calling code handle the redirect
      Cookies.remove("authToken");
      Cookies.remove("userRole");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userRole");
      }
      return null;
    }

    const userData = await response.json();
    
    // Get role directly from backend response (most reliable)
    let role: UserRole;
    
    if (userData.role) {
      // Backend explicitly provided the role - use it!
      const backendRole = userData.role;
      if (backendRole === 'candidat' || backendRole === 'candidate') {
        role = 'candidat';
      } else if (backendRole === 'entreprise' || backendRole === 'enterprise') {
        role = 'entreprise';
      } else if (backendRole === 'admin') {
        role = 'admin';
      } else {
        console.warn('Unknown role from backend:', backendRole);
        role = 'candidat'; // Safe fallback
      }
    } else {
      // Fallback: try to determine from user data structure (less reliable)
      console.warn('Backend did not provide role, attempting to detect from user data');
      
      // Check if it's a candidate (has first_name, last_name, job_id)
      if (userData.first_name || userData.last_name || userData.job_id !== undefined) {
        role = 'candidat';
      } 
      // Check if it's an enterprise (has company_name, sector_id, or siret)
      else if (userData.company_name || userData.sector_id || userData.siret) {
        role = 'entreprise';
      }
      // Check if it's an admin (has specific admin fields)
      else if (userData.is_admin || userData.user_type === 'admin') {
        role = 'admin';
      }
      // Final fallback to checking stored role
      else {
        const storedRole = Cookies.get("userRole");
        role = (storedRole as UserRole) || 'candidat';
      }
    }

    console.log('👤 User role detected:', role, 'from backend response');

    return {
      ...userData,
      role
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Don't call logout() here - just clear the token to prevent redirect loops
    Cookies.remove("authToken");
    Cookies.remove("userRole");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userRole");
    }
    return null;
  }
}

// Cache for authentication check to prevent multiple simultaneous calls
let authCheckPromise: Promise<AuthUser | null> | null = null;
let lastAuthCheck: { timestamp: number; result: AuthUser | null } | null = null;
const AUTH_CACHE_DURATION = 5000; // 5 seconds cache

// Check if user is authenticated and get their role
export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  // First check if we have a token
  const token = Cookies.get("authToken");
  if (!token) {
    return null;
  }

  // Check if we have a recent cached result
  if (lastAuthCheck && Date.now() - lastAuthCheck.timestamp < AUTH_CACHE_DURATION) {
    console.log('🔄 Using cached auth result');
    return lastAuthCheck.result;
  }

  // If there's already a check in progress, return that promise
  if (authCheckPromise) {
    console.log('⏳ Auth check already in progress, waiting...');
    return authCheckPromise;
  }

  // Start a new auth check
  authCheckPromise = getUserFromToken()
    .then(result => {
      // Cache the result
      lastAuthCheck = {
        timestamp: Date.now(),
        result
      };
      authCheckPromise = null;
      return result;
    })
    .catch(error => {
      console.error('Auth check failed:', error);
      authCheckPromise = null;
      return null;
    });

  return authCheckPromise;
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
    // Use role-specific login endpoint
    const roleEndpoint = expectedRole === "candidate" ? "candidate" : "entreprise";
    const endpoint = `/api/${apiVersion}/auth/${roleEndpoint}/login`;

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
      let errorMessage = errorData.message || "Une erreur s'est produite lors de la connexion";

      if (response.status === 401) {
        errorType = 'credentials';
        errorMessage = errorData.message || "Email ou mot de passe incorrect";
      } else if (response.status === 403) {
        errorType = 'verification';
        errorMessage = errorData.message || "Votre compte doit être vérifié avant de vous connecter";
      } else if (response.status === 422) {
        errorType = 'validation';
        errorMessage = errorData.message || "Données de connexion invalides";
      } else if (response.status >= 500) {
        errorType = 'server';
        errorMessage = errorData.message || "Erreur du serveur, veuillez réessayer plus tard";
      }

      return {
        success: false,
        error: errorMessage,
        errorType
      };
    }

    const data = await response.json();
    
    // Store the auth token from the nested data structure
    const authToken = data.data?.token || data.token || data.access_token;
    if (authToken) {
      Cookies.set("authToken", authToken, { expires: 7 }); // 7 days
    } else {
      console.error("No token received from login response");
      return {
        success: false,
        error: "Erreur d'authentification - aucun token reçu",
        errorType: 'server'
      };
    }
    
    // Store user data in session storage
    if (data.data?.user) {
      sessionStorage.setItem("user", JSON.stringify(data.data.user));
    } else if (data.data) {
      sessionStorage.setItem("user", JSON.stringify(data.data));
    } else if (data.user) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
    }
    
    // Get the actual role from the backend response
    const backendRole = data.data?.role || data.role || data.data?.user_type || data.user_type;
    
    // Map backend role to frontend UserRole type
    let userRole: UserRole;
    if (backendRole === 'candidat' || backendRole === 'candidate') {
      userRole = 'candidat';
    } else if (backendRole === 'entreprise' || backendRole === 'enterprise') {
      userRole = 'entreprise';
    } else if (backendRole === 'admin') {
      userRole = 'admin';
    } else {
      // Fallback to expected role if backend doesn't provide one
      console.warn('No role provided by backend, using expected role:', expectedRole);
      userRole = expectedRole === "candidate" ? "candidat" : "entreprise";
    }
    
    // Store role for quick access in both cookies and sessionStorage
    Cookies.set("userRole", userRole, { expires: 7 });
    sessionStorage.setItem("userRole", userRole); // IMPORTANT: For sidebar navigation
    
    console.log('🔐 Login successful - Redirecting to dashboard:', userRole);
    
    // Redirect to appropriate dashboard based on actual role from database
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