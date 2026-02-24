import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  tel?: string;
  image?: string;
  role?: string;
  [key: string]: any;
}

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get current user data
 * Assumes user is already authenticated (use within protected routes)
 * First checks sessionStorage, then fetches from backend if needed
 */
export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try sessionStorage first
      const cachedUser = typeof window !== 'undefined' 
        ? window.sessionStorage?.getItem('user')
        : null;

      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        setIsLoading(false);
        return;
      }

      // If not in sessionStorage, fetch from backend
      const token = Cookies.get('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      
      // Save to sessionStorage for future use
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('user', JSON.stringify(userData));
      }

      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error fetching user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
  };
}
