/**
 * Environment-based configuration utility
 * Handles different URLs and settings for development and production
 */

export const config = {
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // API URLs
  api: {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
  },

  // Frontend URLs
  frontend: {
    baseUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  },

  // OAuth redirect URLs
  oauth: {
    google: {
      redirectUrl: process.env.NEXT_PUBLIC_FRONTEND_URL 
        ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/google`
        : 'http://localhost:3000/auth/google'
    },
    linkedin: {
      redirectUrl: process.env.NEXT_PUBLIC_FRONTEND_URL 
        ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/linkedin`
        : 'http://localhost:3000/auth/linkedin'
    }
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
  },

  // UploadThing
  uploadThing: {
    secret: process.env.UPLOADTHING_SECRET,
    appId: process.env.UPLOADTHING_APP_ID,
  }
};

/**
 * Get the appropriate URL based on environment
 */
export const getUrl = (path: string = '') => {
  const baseUrl = config.frontend.baseUrl;
  return path ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : baseUrl;
};

/**
 * Get API URL with path
 */
export const getApiUrl = (path: string = '') => {
  const baseUrl = config.api.baseUrl;
  return path ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : baseUrl;
};

/**
 * Log current environment configuration (development only)
 */
export const logConfig = () => {
  if (config.isDevelopment) {
    console.log('🔧 Environment Configuration:', {
      environment: process.env.NODE_ENV,
      apiUrl: config.api.baseUrl,
      frontendUrl: config.frontend.baseUrl,
      oauthRedirects: config.oauth,
    });
  }
};