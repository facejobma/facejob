'use client';

import { useState, useEffect } from 'react';
import { api, type ApiResponse } from '@/lib/api';

/**
 * Custom hook for API calls with loading states and error handling
 */
export function useApi<T = any>(
  endpoint?: string,
  options?: {
    immediate?: boolean;
    requireAuth?: boolean;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (customEndpoint?: string, customOptions?: any) => {
    const finalEndpoint = customEndpoint || endpoint;
    if (!finalEndpoint) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.request<T>(finalEndpoint, {
        ...options,
        ...customOptions
      });

      if (result.status >= 200 && result.status < 300) {
        setData(result.data || null);
      } else {
        setError(result.error || 'Request failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options?.immediate && endpoint) {
      execute();
    }
  }, [endpoint, options?.immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: () => execute()
  };
}

/**
 * Hook for authentication state management
 */
export function useAuthState() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const result = await api.getCurrentUser();
      if (result.status === 200 && result.data) {
        setUser(result.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        api.removeAuthToken();
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      api.removeAuthToken();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: { 
    email: string; 
    password: string; 
    userType: 'candidate' | 'entreprise' | 'admin' 
  }, remember: boolean = false) => {
    setLoading(true);
    try {
      const result = await api.login(credentials);
      if (result.status === 200 && result.data?.token) {
        api.setAuthToken(result.data.token, remember);
        await checkAuth(); // Refresh user data
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
      setIsAuthenticated(false);
      // Redirect will be handled by the api.logout() method
    } catch (error) {
      // Even if logout fails, clear local state
      api.removeAuthToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refetch: checkAuth
  };
}

/**
 * Hook for form submissions with API integration
 */
export function useApiForm<T = any>(
  endpoint: string,
  options?: {
    method?: 'POST' | 'PUT' | 'PATCH';
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (formData: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await api.request<T>(endpoint, {
        method: options?.method || 'POST',
        body: formData
      });

      if (result.status >= 200 && result.status < 300) {
        setSuccess(true);
        options?.onSuccess?.(result.data);
        return { success: true, data: result.data };
      } else {
        const errorMessage = result.error || 'Submission failed';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = 'Network error';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    submit,
    loading,
    error,
    success,
    reset
  };
}

/**
 * Hook for file uploads
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, endpoint: string = '/upload') => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // For uploadthing, we'll use the existing configuration
      // This is a placeholder for the actual upload logic
      const headers = api.getUploadHeaders();
      
      // The actual upload will be handled by uploadthing
      // This is just for progress tracking
      setProgress(100);
      setUploading(false);
      
      return { success: true, url: 'placeholder-url' };
    } catch (err) {
      setError('Upload failed');
      setUploading(false);
      return { success: false, error: 'Upload failed' };
    }
  };

  return {
    upload,
    uploading,
    progress,
    error
  };
}