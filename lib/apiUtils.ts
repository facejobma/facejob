// API utility functions for consistent error handling

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorType?: 'validation' | 'credentials' | 'verification' | 'network' | 'server' | 'client';
  errors?: Record<string, string[]>;
  details?: Record<string, string[]>; // Backend validation errors
}

/**
 * Handles API responses consistently across the application
 */
export async function handleApiResponse<T = any>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        data
      };
    }

    // Handle different error types based on status code
    let errorType: ApiResponse['errorType'] = 'server';
    let errorMessage = "Une erreur s'est produite";

    switch (response.status) {
      case 400:
        errorType = 'client';
        errorMessage = data.message || "Requête invalide";
        break;
      case 401:
        errorType = 'credentials';
        errorMessage = "Email ou mot de passe incorrect";
        break;
      case 403:
        errorType = 'verification';
        errorMessage = "Accès refusé - vérification requise";
        break;
      case 404:
        errorType = 'client';
        errorMessage = "Ressource non trouvée";
        break;
      case 409:
        errorType = 'validation';
        errorMessage = "Cette ressource existe déjà";
        break;
      case 422:
        errorType = 'validation';
        errorMessage = data.message || "Données invalides";
        break;
      case 429:
        errorType = 'client';
        errorMessage = "Trop de tentatives, veuillez réessayer plus tard";
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = 'server';
        errorMessage = "Erreur du serveur, veuillez réessayer plus tard";
        break;
      default:
        errorMessage = data.message || "Une erreur inattendue s'est produite";
    }

    // Process validation errors to ensure they're in the right format
    let processedErrors = data.errors || data.details; // Handle both 'errors' and 'details' from backend
    if (processedErrors) {
      // Convert single strings to arrays for consistency
      processedErrors = Object.keys(processedErrors).reduce((acc, key) => {
        const error = processedErrors[key];
        acc[key] = Array.isArray(error) ? error : [error];
        return acc;
      }, {} as Record<string, string[]>);
    }

    return {
      success: false,
      error: errorMessage,
      errorType,
      errors: processedErrors,
      details: data.details // Keep original details for backward compatibility
    };

  } catch (parseError) {
    // If we can't parse the response, it's likely a network error
    return {
      success: false,
      error: "Erreur de connexion, vérifiez votre connexion internet",
      errorType: 'network'
    };
  }
}

/**
 * Makes an API request with consistent error handling
 * Automatically includes authentication token if available
 */
export async function apiRequest<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get auth token from cookies or sessionStorage
    let authToken: string | undefined;
    
    if (typeof window !== 'undefined') {
      // First try sessionStorage (most reliable during signup flow)
      authToken = sessionStorage.getItem('authToken') || undefined;
      
      // If not in sessionStorage, try cookies
      if (!authToken) {
        try {
          const Cookies = require('js-cookie');
          authToken = Cookies.default?.get('authToken') || Cookies.get?.('authToken');
        } catch (e) {
          // Cookie reading failed, continue without token
          console.warn('Failed to read auth token from cookies:', e);
        }
      }
      
      // Debug log
      if (!authToken) {
        console.warn('No auth token found for request to:', url);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: "Erreur de connexion, vérifiez votre connexion internet",
      errorType: 'network'
    };
  }
}

/**
 * Displays appropriate toast message based on API response
 */
export function handleApiError(response: ApiResponse, toast: any) {
  if (response.success) return;

  // If we have validation errors, show the first one
  const validationErrors = response.errors || response.details;
  if (validationErrors && Object.keys(validationErrors).length > 0) {
    const firstError = Object.values(validationErrors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      toast.error(firstError[0]);
      return;
    }
  }

  // Otherwise show the general error message
  toast.error(response.error || "Une erreur s'est produite");
}

/**
 * Gets user-friendly error message based on error type
 */
export function getErrorMessage(errorType: ApiResponse['errorType'], defaultMessage?: string): string {
  switch (errorType) {
    case 'credentials':
      return "Email ou mot de passe incorrect";
    case 'verification':
      return "Votre compte doit être vérifié";
    case 'validation':
      return "Veuillez vérifier les informations saisies";
    case 'network':
      return "Erreur de connexion, vérifiez votre connexion internet";
    case 'server':
      return "Erreur du serveur, veuillez réessayer plus tard";
    case 'client':
      return "Requête invalide";
    default:
      return defaultMessage || "Une erreur s'est produite";
  }
}