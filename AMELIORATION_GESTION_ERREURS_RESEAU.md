# 🔧 Amélioration: Gestion des erreurs réseau

## Problème actuel

Quand une erreur réseau se produit (perte de connexion temporaire), l'application déconnecte l'utilisateur même si son token est toujours valide.

```typescript
// lib/auth.ts - Comportement actuel
catch (error) {
  console.error('Error fetching user data:', error);
  // ⚠️ Supprime le cookie même pour une erreur réseau temporaire
  Cookies.remove("authToken");
  Cookies.remove("userRole");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("userRole");
  return null;
}
```

---

## Solution proposée

### 1. Distinguer les types d'erreurs

```typescript
// lib/auth.ts - getUserFromToken()

export async function getUserFromToken(): Promise<AuthUser | null> {
  const token = Cookies.get("authToken");
  
  if (!token) {
    return null;
  }

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    // ✅ Token invalide ou expiré - supprimer
    if (!response.ok) {
      console.warn('❌ Token invalid or expired, clearing auth data');
      Cookies.remove("authToken");
      Cookies.remove("userRole");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userRole");
      }
      return null;
    }

    const userData = await response.json();
    // ... reste du code
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    
    // 🔍 Distinguer erreur réseau vs autre erreur
    const isNetworkError = 
      error instanceof TypeError || 
      (error instanceof Error && (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch')
      ));
    
    if (isNetworkError) {
      // ✅ Erreur réseau - GARDER le cookie pour retry
      console.warn('⚠️ Network error detected, keeping token for retry');
      return null; // Retourne null mais garde le cookie
    }
    
    // ❌ Autre erreur - supprimer le cookie
    console.warn('❌ Non-network error, clearing auth data');
    Cookies.remove("authToken");
    Cookies.remove("userRole");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userRole");
    }
    return null;
  }
}
```

---

### 2. Ajouter un retry automatique

```typescript
// lib/auth.ts - Nouvelle fonction avec retry

async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 2
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response; // Succès
    } catch (error) {
      lastError = error as Error;
      
      // Si c'est la dernière tentative, throw l'erreur
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Attendre avant de réessayer (backoff exponentiel)
      const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
      console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Utiliser dans getUserFromToken()
export async function getUserFromToken(): Promise<AuthUser | null> {
  const token = Cookies.get("authToken");
  
  if (!token) {
    return null;
  }

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`;
    
    // ✅ Utiliser fetchWithRetry au lieu de fetch
    const response = await fetchWithRetry(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    }, 2); // 2 retries = 3 tentatives au total

    // ... reste du code
    
  } catch (error) {
    // Même logique de gestion d'erreur
  }
}
```

---

### 3. Améliorer useAuthGuard pour gérer les erreurs réseau

```typescript
// hooks/useAuthGuard.ts

export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const { requiredRole, redirectTo } = options;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [networkError, setNetworkError] = useState(false); // ✅ Nouveau state
  const hasChecked = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (hasChecked.current) {
      return;
    }
    hasChecked.current = true;

    const checkAuth = async () => {
      try {
        // ... code existant ...
        
        const result = await globalAuthCheck;
        
        if (!isMounted.current) return;
        
        handleAuthResult(result);
      } catch (error) {
        console.error('❌ Auth guard error:', error);
        globalAuthCheck = null;
        
        if (!isMounted.current) return;
        
        // ✅ Vérifier si c'est une erreur réseau
        const isNetworkError = 
          error instanceof TypeError || 
          (error instanceof Error && error.message.includes('fetch'));
        
        if (isNetworkError) {
          // Erreur réseau - ne pas rediriger, afficher un message
          setNetworkError(true);
          setIsLoading(false);
          setIsAuthorized(false);
        } else {
          // Autre erreur - rediriger vers login
          setIsLoading(false);
          setIsAuthorized(false);
          if (redirectTo) {
            router.replace(redirectTo);
          }
        }
      }
    };

    checkAuth();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return { 
    isLoading, 
    isAuthorized, 
    user,
    networkError // ✅ Exposer l'état d'erreur réseau
  };
}
```

---

### 4. Afficher un message d'erreur réseau dans le layout

```typescript
// app/(dashboard)/dashboard/candidat/layout.tsx

export default function CandidatLayout({ children, params }: LayoutProps) {
  const { isLoading, isAuthorized, networkError } = useAuthGuard({
    requiredRole: 'candidat',
    redirectTo: '/auth/login-candidate',
  });

  if (isLoading) {
    return <SimpleLoadingBar />;
  }

  // ✅ Afficher un message d'erreur réseau
  if (networkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Problème de connexion
          </h2>
          <p className="text-gray-600 mb-6">
            Impossible de vérifier votre session. Vérifiez votre connexion internet et réessayez.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <CandidatClientLayout params={params}>
      {children}
    </CandidatClientLayout>
  );
}
```

---

### 5. Améliorer useUser pour gérer les erreurs réseau

```typescript
// hooks/useUser.ts

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false); // ✅ Nouveau

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsNetworkError(false);

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
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // ✅ Détecter erreur réseau
      const isNetwork = 
        err instanceof TypeError || 
        (err instanceof Error && err.message.includes('fetch'));
      
      setIsNetworkError(isNetwork);
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
    isNetworkError, // ✅ Exposer
    refetch: fetchUser,
  };
}
```

---

## 📋 Checklist d'implémentation

### Phase 1: Gestion basique des erreurs réseau ✅
- [ ] Modifier `getUserFromToken()` pour distinguer erreurs réseau
- [ ] Ne pas supprimer le cookie sur erreur réseau
- [ ] Tester avec mode avion

### Phase 2: Retry automatique ✅
- [ ] Créer fonction `fetchWithRetry()`
- [ ] Intégrer dans `getUserFromToken()`
- [ ] Configurer backoff exponentiel (1s, 2s, 3s max)
- [ ] Tester avec connexion instable

### Phase 3: UI pour erreurs réseau ✅
- [ ] Ajouter `networkError` state dans `useAuthGuard`
- [ ] Créer composant d'erreur réseau dans layouts
- [ ] Ajouter bouton "Réessayer"
- [ ] Tester l'expérience utilisateur

### Phase 4: Améliorer useUser ✅
- [ ] Ajouter `isNetworkError` dans `useUser`
- [ ] Gérer les erreurs réseau dans les pages
- [ ] Afficher message approprié
- [ ] Permettre retry manuel

---

## 🧪 Tests à effectuer

### Test 1: Perte de connexion temporaire
```bash
1. Se connecter
2. Activer mode avion
3. Naviguer vers /dashboard/candidat
4. Vérifier: Message d'erreur réseau (pas de déconnexion)
5. Désactiver mode avion
6. Cliquer "Réessayer"
7. Vérifier: Accès au dashboard sans reconnexion
```

### Test 2: Retry automatique
```bash
1. Se connecter
2. Simuler connexion lente (DevTools > Network > Slow 3G)
3. Naviguer vers /dashboard/candidat
4. Vérifier: 2-3 tentatives avant erreur
5. Vérifier: Logs console montrent les retries
```

### Test 3: Token invalide vs erreur réseau
```bash
1. Se connecter
2. Modifier cookie avec valeur invalide
3. Naviguer vers /dashboard/candidat
4. Vérifier: Déconnexion immédiate (pas de retry)

5. Se reconnecter
6. Activer mode avion
7. Naviguer vers /dashboard/candidat
8. Vérifier: Message d'erreur réseau (retry possible)
```

---

## 📊 Comparaison avant/après

| Situation | Avant | Après |
|-----------|-------|-------|
| Erreur réseau temporaire | ❌ Déconnexion | ✅ Message + retry |
| Token invalide | ✅ Déconnexion | ✅ Déconnexion |
| Cookie expiré | ✅ Déconnexion | ✅ Déconnexion |
| Connexion lente | ❌ Timeout → déconnexion | ✅ Retry automatique |

---

## 🎯 Bénéfices

1. **Meilleure expérience utilisateur**
   - Pas de déconnexion sur problème réseau temporaire
   - Message clair sur la cause du problème
   - Possibilité de réessayer sans se reconnecter

2. **Résilience accrue**
   - Retry automatique sur erreurs temporaires
   - Backoff exponentiel pour ne pas surcharger le serveur
   - Distinction claire entre erreurs réseau et erreurs d'auth

3. **Sécurité maintenue**
   - Token invalide → déconnexion immédiate
   - Cookie expiré → déconnexion immédiate
   - Pas de compromis sur la sécurité

---

## 📝 Notes d'implémentation

### Ordre d'implémentation recommandé:
1. Phase 1 (gestion basique) - 30 min
2. Phase 2 (retry) - 45 min
3. Phase 3 (UI) - 1h
4. Phase 4 (useUser) - 30 min
5. Tests - 1h

**Total estimé: 3-4 heures**

### Fichiers à modifier:
- `facejob/lib/auth.ts`
- `facejob/hooks/useAuthGuard.ts`
- `facejob/hooks/useUser.ts`
- `facejob/app/(dashboard)/dashboard/candidat/layout.tsx`
- `facejob/app/(dashboard)/dashboard/entreprise/layout.tsx`

---

## ✅ Conclusion

Cette amélioration résout le problème principal de déconnexion sur erreur réseau temporaire tout en maintenant la sécurité de l'application. L'implémentation est progressive et peut être testée à chaque phase.

**Recommandation: Implémenter au minimum la Phase 1 et Phase 3 pour une meilleure expérience utilisateur.**
