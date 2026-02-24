# 🍪 Comportement lors de l'expiration du cookie

## Question
**Que se passe-t-il quand le cookie `authToken` expire?**

---

## 📊 Analyse du comportement actuel

### 1. Configuration du cookie

**Durée de vie:** 7 jours
```typescript
// Dans lib/auth.ts - secureLogin()
Cookies.set("authToken", authToken, { expires: 7 }); // 7 jours
```

**Type de token backend:** Laravel Sanctum Personal Access Token
- ⚠️ **Ces tokens n'expirent JAMAIS par défaut dans Laravel Sanctum**
- Le cookie frontend expire après 7 jours, mais le token backend reste valide

---

## 🔄 Scénarios d'expiration

### Scénario A: Cookie expire (après 7 jours) mais token backend valide

**Ce qui se passe:**

1. **Utilisateur navigue vers `/dashboard/candidat`**
   ```
   → Layout: useAuthGuard() s'exécute
   → Vérifie Cookies.get("authToken")
   → Cookie expiré = null
   → getAuthenticatedUser() retourne null
   → isAuthorized = false
   → Redirection vers /auth/login-candidate
   ```

2. **Utilisateur est déconnecté automatiquement**
   - ✅ Comportement correct
   - ✅ Redirection vers la page de login
   - ✅ Pas de boucle de redirection

**Code responsable:**
```typescript
// hooks/useAuthGuard.ts
if (!cachedUser) {
  setIsLoading(false);
  setIsAuthorized(false);
  if (redirectTo) {
    router.replace(redirectTo); // Redirige vers /auth/login-candidate
  }
  return;
}
```

---

### Scénario B: Token backend révoqué/invalide mais cookie existe

**Ce qui se passe:**

1. **Utilisateur navigue vers `/dashboard/candidat`**
   ```
   → Layout: useAuthGuard() s'exécute
   → Cookie existe
   → Appel API: GET /api/v1/user avec Bearer token
   → Backend retourne 401 Unauthorized
   → getUserFromToken() détecte response.ok = false
   ```

2. **Nettoyage automatique:**
   ```typescript
   // lib/auth.ts - getUserFromToken()
   if (!response.ok) {
     // Token invalide, nettoyage silencieux
     Cookies.remove("authToken");
     Cookies.remove("userRole");
     sessionStorage.removeItem("user");
     sessionStorage.removeItem("userRole");
     return null;
   }
   ```

3. **Redirection:**
   ```
   → getAuthenticatedUser() retourne null
   → useAuthGuard détecte null
   → Redirection vers /auth/login-candidate
   ```

**Résultat:**
- ✅ Cookie invalide supprimé automatiquement
- ✅ SessionStorage nettoyé
- ✅ Redirection vers login
- ✅ Pas de boucle de redirection

---

### Scénario C: Erreur réseau lors de la vérification

**Ce qui se passe:**

1. **Utilisateur navigue vers `/dashboard/candidat`**
   ```
   → Layout: useAuthGuard() s'exécute
   → Cookie existe
   → Appel API: GET /api/v1/user
   → Erreur réseau (timeout, pas de connexion, etc.)
   → catch(error) dans getUserFromToken()
   ```

2. **Nettoyage et redirection:**
   ```typescript
   // lib/auth.ts - getUserFromToken()
   catch (error) {
     console.error('Error fetching user data:', error);
     Cookies.remove("authToken");
     Cookies.remove("userRole");
     sessionStorage.removeItem("user");
     sessionStorage.removeItem("userRole");
     return null;
   }
   ```

3. **Résultat:**
   - ⚠️ Utilisateur déconnecté même si le token est valide
   - ⚠️ Doit se reconnecter après une erreur réseau temporaire

---

## 🎯 Comportement dans les pages

### Pages protégées (avec useAuthGuard)

**Exemple: `/dashboard/candidat/profile`**

```typescript
// layout.tsx
const { isLoading, isAuthorized } = useAuthGuard({
  requiredRole: 'candidat',
  redirectTo: '/auth/login-candidate',
});

if (isLoading) return <LoadingSpinner />; // Pendant la vérification
if (!isAuthorized) return null; // Avant la redirection
```

**Comportement lors de l'expiration:**
1. `isLoading = true` → Affiche le spinner
2. Vérification du cookie → Expiré
3. `isAuthorized = false` → Retourne null
4. Redirection vers `/auth/login-candidate`
5. **Durée totale: ~100-500ms** (très rapide)

---

### Pages avec useUser (après useAuthGuard)

**Exemple: `/dashboard/candidat/profile/page.tsx`**

```typescript
const { user, isLoading: userLoading } = useUser();

if (userLoading) return <LoadingSpinner />;
```

**Comportement lors de l'expiration:**
1. `useAuthGuard` détecte l'expiration en premier
2. Redirection avant que `useUser` ne s'exécute
3. **useUser ne voit jamais le cookie expiré** car la page est déjà redirigée

---

## 📱 Expérience utilisateur

### Cas 1: Utilisateur inactif pendant 7+ jours

**Timeline:**
```
Jour 0: Login → Cookie créé (expire dans 7 jours)
Jour 7: Cookie expire automatiquement
Jour 8: Utilisateur revient sur le site
  → Navigue vers /dashboard/candidat
  → Voit le spinner pendant ~200ms
  → Redirigé vers /auth/login-candidate
  → Message: "Veuillez vous reconnecter"
```

**Expérience:**
- ✅ Pas d'erreur visible
- ✅ Redirection fluide
- ✅ Message clair (si implémenté)

---

### Cas 2: Token révoqué par l'admin

**Timeline:**
```
Admin révoque le token dans le backend
Utilisateur navigue vers une page protégée
  → API retourne 401
  → Cookie supprimé automatiquement
  → Redirection vers login
```

**Expérience:**
- ✅ Déconnexion immédiate
- ✅ Pas de données sensibles exposées
- ✅ Sécurité maintenue

---

### Cas 3: Erreur réseau temporaire

**Timeline:**
```
Utilisateur perd la connexion internet
Navigue vers /dashboard/candidat
  → Appel API échoue
  → Cookie supprimé (⚠️ problématique)
  → Redirection vers login
Connexion revient
  → Utilisateur doit se reconnecter
```

**Expérience:**
- ⚠️ Déconnexion non nécessaire
- ⚠️ Frustration utilisateur
- ⚠️ Perte de session valide

---

## 🔧 Améliorations possibles

### 1. Gestion des erreurs réseau ⭐ RECOMMANDÉ

**Problème actuel:**
```typescript
// lib/auth.ts
catch (error) {
  // Supprime le cookie même pour une erreur réseau temporaire
  Cookies.remove("authToken");
  return null;
}
```

**Solution proposée:**
```typescript
catch (error) {
  console.error('Error fetching user data:', error);
  
  // Distinguer erreur réseau vs erreur d'authentification
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Erreur réseau - garder le cookie
    console.warn('Network error, keeping token for retry');
    return null; // Retourne null mais garde le cookie
  }
  
  // Autre erreur - supprimer le cookie
  Cookies.remove("authToken");
  Cookies.remove("userRole");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("userRole");
  return null;
}
```

---

### 2. Message d'expiration explicite ⭐ RECOMMANDÉ

**Ajouter un paramètre de redirection:**
```typescript
// hooks/useAuthGuard.ts
if (!cachedUser) {
  setIsLoading(false);
  setIsAuthorized(false);
  if (redirectTo) {
    // Ajouter un paramètre pour indiquer la raison
    router.replace(`${redirectTo}?reason=session_expired`);
  }
  return;
}
```

**Dans la page de login:**
```typescript
// app/auth/login-candidate/page.tsx
const searchParams = useSearchParams();
const reason = searchParams.get('reason');

useEffect(() => {
  if (reason === 'session_expired') {
    toast.info('Votre session a expiré. Veuillez vous reconnecter.');
  }
}, [reason]);
```

---

### 3. Refresh token (optionnel)

**Avantage:** Session plus longue sans redemander le mot de passe

**Implémentation:**
```typescript
// Stocker un refresh token
Cookies.set("refreshToken", refreshToken, { expires: 30 }); // 30 jours

// Quand authToken expire, utiliser refreshToken
async function refreshAuthToken() {
  const refreshToken = Cookies.get("refreshToken");
  if (!refreshToken) return null;
  
  const response = await fetch('/api/v1/refresh', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${refreshToken}` }
  });
  
  if (response.ok) {
    const { token } = await response.json();
    Cookies.set("authToken", token, { expires: 7 });
    return token;
  }
  
  return null;
}
```

**Note:** Nécessite modification du backend Laravel

---

### 4. Expiration côté backend (optionnel)

**Configuration Laravel Sanctum:**
```php
// config/sanctum.php
'expiration' => 60 * 24 * 7, // 7 jours en minutes
```

**Avantage:** Cohérence entre frontend et backend

**Inconvénient:** Tokens expirés doivent être nettoyés régulièrement

---

## 📋 Résumé du comportement actuel

| Situation | Comportement | Expérience | Statut |
|-----------|-------------|------------|--------|
| Cookie expire (7j) | Redirection vers login | ✅ Fluide | ✅ OK |
| Token révoqué | Nettoyage + redirection | ✅ Sécurisé | ✅ OK |
| Erreur réseau | Déconnexion forcée | ⚠️ Frustrant | ⚠️ À améliorer |
| Token invalide | Nettoyage + redirection | ✅ Sécurisé | ✅ OK |

---

## 🎯 Recommandations

### Priorité HAUTE ⭐⭐⭐
1. **Gérer les erreurs réseau** - Ne pas déconnecter sur erreur temporaire
2. **Message d'expiration** - Informer l'utilisateur pourquoi il est déconnecté

### Priorité MOYENNE ⭐⭐
3. **Retry automatique** - Réessayer 1-2 fois avant de déconnecter
4. **Expiration backend** - Configurer Sanctum pour expirer les tokens

### Priorité BASSE ⭐
5. **Refresh token** - Nécessite modification backend importante

---

## 🧪 Tests recommandés

### Test 1: Expiration normale
```bash
1. Se connecter
2. Modifier manuellement le cookie pour qu'il expire dans 1 minute
3. Attendre 1 minute
4. Naviguer vers /dashboard/candidat
5. Vérifier: Redirection vers login
```

### Test 2: Token invalide
```bash
1. Se connecter
2. Modifier le cookie authToken avec une valeur invalide
3. Naviguer vers /dashboard/candidat
4. Vérifier: Cookie supprimé + redirection
```

### Test 3: Erreur réseau
```bash
1. Se connecter
2. Désactiver le réseau (mode avion)
3. Naviguer vers /dashboard/candidat
4. Vérifier: Comportement actuel (déconnexion)
5. Implémenter amélioration
6. Vérifier: Cookie conservé + message d'erreur
```

---

## 📝 Conclusion

**Comportement actuel: ✅ Fonctionnel mais perfectible**

L'application gère correctement l'expiration du cookie et la révocation des tokens. La principale amélioration à apporter concerne la gestion des erreurs réseau temporaires pour éviter de déconnecter inutilement les utilisateurs.

**Prochaines étapes suggérées:**
1. Implémenter la gestion des erreurs réseau
2. Ajouter un message d'expiration explicite
3. Tester les différents scénarios
4. Considérer l'ajout d'un refresh token si nécessaire
