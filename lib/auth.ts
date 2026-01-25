import Cookies from "js-cookie";

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
    }).catch((error) => {
      console.error("Backend logout error:", error);
    });
  }
  
  console.log("✅ Logout completed, redirecting to home page...");
  
  // Redirect to home page
  window.location.href = "/";
}