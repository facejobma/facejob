import Cookies from "js-cookie";

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
  const domain = window.location.hostname;
  Cookies.remove("authToken", { domain });
  Cookies.remove("refreshToken", { domain });
  Cookies.remove("userRole", { domain });
  Cookies.remove("user", { domain });
}

export function performLogout(userRole?: string | null) {
  // Clear all storage and cookies
  logout();
  
  // Determine redirect path
  const redirectPath = userRole === "candidat" ? "/auth/login-candidate" : "/auth/login-entreprise";
  
  // Call backend logout endpoint if needed
  const authToken = Cookies.get("authToken");
  if (authToken && process.env.NEXT_PUBLIC_BACKEND_URL) {
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    }).catch((error) => {
      console.error("Backend logout error:", error);
    });
  }
  
  // Redirect to login page
  window.location.href = redirectPath;
}