import { useState, useEffect, useRef } from 'react';
import { getAuthenticatedUser, AuthUser } from '@/lib/auth';

/**
 * Hook optimisé pour gérer l'authentification
 * Évite les appels répétés à l'API en utilisant un cache partagé
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    // Ne vérifier qu'une seule fois par montage du composant
    if (hasChecked.current) {
      return;
    }

    const checkAuth = async () => {
      try {
        setLoading(true);
        const authenticatedUser = await getAuthenticatedUser();
        
        if (isMounted.current) {
          setUser(authenticatedUser);
          setError(null);
          hasChecked.current = true;
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err : new Error('Authentication failed'));
          setUser(null);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted.current = false;
    };
  }, []); // Dépendances vides - ne s'exécute qu'une fois

  return { user, loading, error };
}
