/**
 * FaceJob API Client - V1 Enhanced Security
 * 
 * Centralized API client for all backend communications
 * Handles authentication, error handling, and security headers
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

class FaceJobAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  }

  /**
   * Get authentication token from storage (public method)
   */
  public getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  /**
   * Set authentication token in storage
   */
  public setAuthToken(token: string, remember: boolean = false): void {
    if (typeof window === 'undefined') return;
    
    if (remember) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
  }

  /**
   * Remove authentication token from storage
   */
  public removeAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T = any>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requireAuth = true
    } = options;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    };

    // Add authentication if required
    if (requireAuth) {
      const token = this.getAuthToken();
      if (!token) {
        return {
          status: 401,
          error: 'Authentication required'
        };
      }
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Prepare request body
    let requestBody: string | FormData | undefined;
    if (body) {
      if (body instanceof FormData) {
        requestBody = body;
        delete requestHeaders['Content-Type']; // Let browser set it for FormData
      } else {
        requestBody = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: requestBody,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.removeAuthToken();
          // Redirect to login if in browser
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }

        return {
          status: response.status,
          error: responseData.message || responseData.error || 'Request failed',
          data: responseData
        };
      }

      return {
        status: response.status,
        data: responseData,
        message: responseData.message
      };

    } catch (error) {
      console.error('API Request Error:', error);
      return {
        status: 500,
        error: 'Network error or server unavailable'
      };
    }
  }

  // Authentication endpoints
  public async login(credentials: { email: string; password: string; userType: 'candidate' | 'entreprise' | 'admin' }) {
    const endpoint = `/auth/${credentials.userType}/login`;
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: { email: credentials.email, password: credentials.password },
      requireAuth: false
    });
  }

  public async register(userData: any, userType: 'candidate' | 'entreprise') {
    const endpoint = `/auth/${userType}/register`;
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: userData,
      requireAuth: false
    });
  }

  public async logout() {
    const result = await this.makeRequest('/logout', { method: 'POST' });
    this.removeAuthToken();
    return result;
  }

  public async getCurrentUser() {
    return this.makeRequest('/user');
  }

  // Public endpoints (no auth required)
  public async getPublicData(endpoint: string, params?: { page?: number; per_page?: number }) {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, v?.toString() || '']))}` : '';
    return this.makeRequest(`${endpoint}${query}`, { requireAuth: false });
  }

  public async getSectors(params?: { page?: number; per_page?: number }) {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, v?.toString() || '']))}` : '';
    return this.makeRequest(`/sectors${query}`, { requireAuth: false });
  }

  public async getJobs(params?: { page?: number; per_page?: number }) {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, v?.toString() || '']))}` : '';
    return this.makeRequest(`/jobs${query}`, { requireAuth: false });
  }

  public async getJobOffers(page: number = 1, perPage: number = 15) {
    return this.makeRequest(`/offres?page=${page}&per_page=${perPage}`, { requireAuth: false });
  }

  public async getJobOffersBysector(sectorId: number, page: number = 1, perPage: number = 15) {
    return this.makeRequest(`/offres_by_sector/${sectorId}?page=${page}&per_page=${perPage}`, { requireAuth: false });
  }

  public async getPlans(params?: { page?: number; per_page?: number }) {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, v?.toString() || '']))}` : '';
    return this.makeRequest(`/plans${query}`, { requireAuth: false });
  }

  // Protected endpoints (auth required)
  public async getJobOffer(id: number) {
    return this.makeRequest(`/offre/${id}`);
  }

  public async getCandidateProfile(id: number) {
    return this.makeRequest(`/candidate-profile/${id}`);
  }

  public async getEnterpriseProfile(id: number) {
    return this.makeRequest(`/enterprise/${id}`);
  }

  public async updateProfile(data: any) {
    return this.makeRequest('/candidate/update', {
      method: 'POST',
      body: data
    });
  }

  public async completeAccount(data: any, userType: 'candidate' | 'enterprise') {
    return this.makeRequest(`/complete-${userType}`, {
      method: 'PUT',
      body: data
    });
  }

  public async sendEmail(data: { email: string }) {
    return this.makeRequest('/email/send-mail', {
      method: 'POST',
      body: data
    });
  }

  public async submitContact(data: { name: string; email: string; message: string }) {
    return this.makeRequest('/contact', {
      method: 'POST',
      body: data
    });
  }

  // File upload helper
  public getUploadHeaders() {
    const token = this.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Generic request method for custom endpoints
  public async request<T = any>(endpoint: string, options: RequestOptions = {}) {
    return this.makeRequest<T>(endpoint, options);
  }
}

// Export singleton instance
export const api = new FaceJobAPI();

// Export types for use in components
export type { ApiResponse, RequestOptions };

// Helper hooks for React components
export const useAuth = () => {
  const login = async (credentials: { email: string; password: string; userType: 'candidate' | 'entreprise' | 'admin' }, remember: boolean = false) => {
    const result = await api.login(credentials);
    if (result.data?.token) {
      api.setAuthToken(result.data.token, remember);
    }
    return result;
  };

  const logout = async () => {
    await api.logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const isAuthenticated = () => {
    return !!api.getAuthToken();
  };

  return { login, logout, isAuthenticated };
};

// Error handling helper
export const handleApiError = (error: ApiResponse) => {
  if (error.status === 401) {
    // Handle authentication error
    api.removeAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  } else if (error.status === 403) {
    // Handle authorization error
    console.error('Access denied:', error.error);
  } else if (error.status >= 500) {
    // Handle server error
    console.error('Server error:', error.error);
  }
  
  return error.error || 'An unexpected error occurred';
};