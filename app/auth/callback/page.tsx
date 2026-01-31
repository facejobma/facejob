'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { getCsrfCookie, authenticatedApiCall } from '@/lib/api';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userType = searchParams.get('user_type');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        if (error) {
          console.error('❌ OAuth Callback - Error received:', error);
          toast.error('Erreur lors de la connexion: ' + error);
          router.push('/auth/login');
          return;
        }

        if (!token || !userType) {
          console.error('❌ OAuth Callback - Missing data:', { token: !!token, userType });
          toast.error('Données d\'authentification manquantes');
          router.push('/auth/login');
          return;
        }

        console.log('✅ OAuth Callback - Success:', {
          userType,
          provider,
          hasToken: !!token
        });

        // Store authentication data in both localStorage and cookies for compatibility
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_type', userType);
        localStorage.setItem('auth_provider', provider || 'unknown');
        
        // Also store in cookies for component compatibility
        Cookies.set('authToken', token, { expires: 7 });
        Cookies.set('user_type', userType, { expires: 7 });

        // Create user object from OAuth response data
        const userData = {
          id: Date.now(), // temporary ID, will be replaced when we fetch real user data
          user_type: userType,
          provider: provider,
          authenticated: true
        };

        // Store user data in sessionStorage for dashboard layouts
        sessionStorage.setItem('user', JSON.stringify(userData));

        // Get CSRF cookie first, then fetch user data
        console.log('🍪 Getting CSRF cookie...');
        
        try {
          // First, get CSRF cookie
          await getCsrfCookie();
          
          // Now fetch user data with both Bearer token and cookies
          console.log('🔍 Fetching user data with token:', token.substring(0, 20) + '...');
          
          const userResponse = await authenticatedApiCall('/api/user');
          
          if (userResponse.ok) {
            const fullUserData = await userResponse.json();
            console.log('✅ Full user data received:', fullUserData);
            // Update with real user data if available
            sessionStorage.setItem('user', JSON.stringify(fullUserData));
          } else {
            console.warn('⚠️ User data API failed:', userResponse.status, userResponse.statusText);
          }
          
        } catch (error) {
          console.warn('❌ Could not fetch user data:', error);
          // Keep the minimal user data we already stored
        }

        // Show success message
        toast.success(`Connexion réussie via ${provider === 'linkedin' ? 'LinkedIn' : 'Google'}!`);

        // Redirect based on user type
        if (userType === 'candidate') {
          router.push('/dashboard/candidat');
        } else if (userType === 'entreprise') {
          router.push('/dashboard/entreprise');
        } else {
          router.push('/');
        }

      } catch (error) {
        console.error('Error processing callback:', error);
        toast.error('Erreur lors du traitement de la connexion');
        router.push('/auth/login');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Finalisation de la connexion...
          </h2>
          <p className="text-gray-600">
            Veuillez patienter pendant que nous vous connectons.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement...
          </h2>
          <p className="text-gray-600">
            Préparation de la connexion.
          </p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}