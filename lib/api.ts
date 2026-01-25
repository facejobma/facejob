// API utility functions with proper authentication handling
import Cookies from 'js-cookie';

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Make authenticated API calls with proper cookie and token handling
 */
export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { requireAuth = false, ...fetchOptions } = options; // Default to false for public endpoints
  
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
  
  // Ensure endpoint starts with /api/v1/ if it's a relative path
  let fullEndpoint = endpoint;
  if (!endpoint.startsWith('http') && !endpoint.startsWith('/api/v1/')) {
    if (endpoint.startsWith('/api/')) {
      fullEndpoint = endpoint.replace('/api/', `/api/${apiVersion}/`);
    } else if (endpoint.startsWith('/')) {
      fullEndpoint = `/api/${apiVersion}${endpoint}`;
    } else {
      fullEndpoint = `/api/${apiVersion}/${endpoint}`;
    }
  }
  
  const url = fullEndpoint.startsWith('http') ? fullEndpoint : `${baseUrl}${fullEndpoint}`;
  
  // Default headers
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };
  
  // Add Bearer token if available and required
  if (requireAuth) {
    // Check both localStorage and cookies for token (for compatibility)
    let token: string | null = localStorage.getItem('access_token');
    if (!token) {
      // Fallback to cookies if localStorage doesn't have the token
      token = Cookies.get('authToken') || null;
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Always include credentials for cookies
  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: 'include', // Always include cookies
  };
  
  console.log('🌐 API Call:', {
    url,
    method: requestOptions.method || 'GET',
    hasAuth: !!headers['Authorization'],
    requireAuth,
    credentials: requestOptions.credentials,
    token: requireAuth ? (localStorage.getItem('access_token') ? 'localStorage' : Cookies.get('authToken') ? 'cookies' : 'none') : 'not-required'
  });
  
  try {
    const response = await fetch(url, requestOptions);
    
    console.log('🌐 API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    return response;
  } catch (error) {
    console.error('🌐 API Error:', { url, error });
    throw error;
  }
}

/**
 * Get CSRF cookie before making authenticated requests
 */
export async function getCsrfCookie() {
  try {
    console.log('🍪 Getting CSRF cookie...');
    await apiCall('/sanctum/csrf-cookie', { 
      requireAuth: false,
      method: 'GET'
    });
    console.log('✅ CSRF cookie obtained');
  } catch (error) {
    console.warn('❌ Failed to get CSRF cookie:', error);
  }
}

/**
 * Make authenticated API call with automatic CSRF handling
 */
export async function authenticatedApiCall(endpoint: string, options: ApiOptions = {}) {
  // Get CSRF cookie first if this is a state-changing request
  const method = options.method?.toUpperCase();
  if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    await getCsrfCookie();
  }
  
  return apiCall(endpoint, { requireAuth: true, ...options });
}

/**
 * Make public API call (no authentication required)
 */
export async function publicApiCall(endpoint: string, options: ApiOptions = {}) {
  return apiCall(endpoint, { requireAuth: false, ...options });
}

// =============================================================================
// PUBLIC API ENDPOINTS (No authentication required)
// =============================================================================

export async function fetchSectors() {
  const response = await publicApiCall('/api/sectors');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch sectors: ${response.status}`);
}

export async function fetchEducations() {
  const response = await publicApiCall('/api/educations');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch educations: ${response.status}`);
}

export async function fetchCountries() {
  const response = await publicApiCall('/api/pays');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch countries: ${response.status}`);
}

export async function fetchDiplomas() {
  const response = await publicApiCall('/api/diplomes');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch diplomas: ${response.status}`);
}

export async function fetchCities() {
  const response = await publicApiCall('/api/villes');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch cities: ${response.status}`);
}

export async function fetchJobs() {
  const response = await publicApiCall('/api/jobs');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch jobs: ${response.status}`);
}

export async function fetchLevels() {
  const response = await publicApiCall('/api/niveaux');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch levels: ${response.status}`);
}

export async function fetchSpecialties() {
  const response = await publicApiCall('/api/specialties');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch specialties: ${response.status}`);
}

export async function fetchOffers() {
  const response = await publicApiCall('/api/offres');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch offers: ${response.status}`);
}

export async function fetchOffersBySector(sectorId: string) {
  const response = await publicApiCall(`/api/offres_by_sector/${sectorId}`);
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch offers by sector: ${response.status}`);
}

export async function fetchOffer(id: string) {
  const response = await publicApiCall(`/api/offre/${id}`);
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch offer: ${response.status}`);
}

export async function fetchCandidateProfile(id: string) {
  const response = await publicApiCall(`/api/candidate-profile/${id}`);
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch candidate profile: ${response.status}`);
}

export async function fetchEnterpriseProfile(id: string) {
  const response = await publicApiCall(`/api/enterprise/${id}`);
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch enterprise profile: ${response.status}`);
}

export async function fetchPlans() {
  const response = await publicApiCall('/api/plans');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch plans: ${response.status}`);
}

export async function fetchEnterprises() {
  const response = await authenticatedApiCall('/api/entreprises');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch enterprises: ${response.status}`);
}

export async function fetchAvailabilityStatus() {
  const response = await authenticatedApiCall('/api/availability/status');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch availability status: ${response.status}`);
}

export async function updateAvailabilityStatus(status: 'available' | 'unavailable') {
  const response = await authenticatedApiCall('/api/availability/update', {
    method: 'POST',
    body: JSON.stringify({ status })
  });
  if (response.ok) return response.json();
  throw new Error(`Failed to update availability status: ${response.status}`);
}

export async function fetchPostuleAll() {
  const response = await authenticatedApiCall('/api/postule/all');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch postule all: ${response.status}`);
}

export async function fetchEntrepriseStats(id: string) {
  const response = await authenticatedApiCall(`/api/entrepirse-stats/${id}`);
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch entreprise stats: ${response.status}`);
}

export async function fetchNotifications() {
  const response = await authenticatedApiCall('/api/notifications');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch notifications: ${response.status}`);
}

export async function markNotificationsAsRead() {
  const response = await authenticatedApiCall('/api/notifications/mark-as-read', {
    method: 'POST'
  });
  if (response.ok) return response.json();
  throw new Error(`Failed to mark notifications as read: ${response.status}`);
}

export async function fetchLastPayment(entrepriseId: string) {
  const response = await authenticatedApiCall(`/api/payments/${entrepriseId}/last`);
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch last payment: ${response.status}`);
}

// =============================================================================
// AUTHENTICATED API ENDPOINTS (Require authentication)
// =============================================================================

export async function fetchUserData() {
  const response = await authenticatedApiCall('/api/user');
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch user data: ${response.status}`);
}

export async function updateCandidate(data: any) {
  const response = await authenticatedApiCall('/api/candidate/update', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (response.ok) return response.json();
  throw new Error(`Failed to update candidate: ${response.status}`);
}

export async function createOffer(data: any) {
  const response = await authenticatedApiCall('/api/offre/create', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (response.ok) return response.json();
  throw new Error(`Failed to create offer: ${response.status}`);
}

export async function logout() {
  const response = await authenticatedApiCall('/api/logout', {
    method: 'POST'
  });
  if (response.ok) return response.json();
  throw new Error(`Failed to logout: ${response.status}`);
}

export async function performCompleteLogout() {
  try {
    // Call backend logout first
    await logout();
  } catch (error) {
    console.warn('Backend logout failed:', error);
  }
  
  // Clear all client-side data regardless of backend response
  if (typeof window !== "undefined") {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies
    const allCookies = document.cookie.split(";");
    allCookies.forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Clear with different path and domain options
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
    
    // Redirect to home page
    window.location.href = "/";
  }
}
