# Fix: Boucle de redirection infinie - Dashboard Candidat

## Problème identifié

L'application créait une boucle infinie de redirections entre 2 routes:
1. `/dashboard/candidat` → vérifié par layout.tsx et client-layout.tsx
2. `/auth/login-candidate` → vérifie l'auth et redirige vers dashboard

### Logs observés
```
GET /dashboard/candidat 200 in 77ms
GET /auth/login-candidate 200 in 124ms
GET /auth/login-candidate 200 in 69ms
GET /dashboard/candidat 200 in 72ms
GET /auth/login-candidate 200 in 128ms
... (répété à l'infini jusqu'au rate limiting)
```

## Cause racine

**Triple vérification d'authentification** créant une boucle:

1. **layout.tsx** (lignes 23-58):
   ```typescript
   useEffect(() => {
     const checkAuth = async () => {
       const user = await getAuthenticatedUser();
       if (!user) {
         router.push("/auth/login-candidate"); // ← Redirection 1
       }
     };
     checkAuth();
   }, [router]);
   ```

2. **client-layout.tsx** (lignes 52-56):
   ```typescript
   useEffect(() => {
     if (!userData) {
       router.push(`/auth/login-candidate`); // ← Redirection 2
     }
   }, [userData, router]);
   ```

3. **login-candidate/page.tsx** (lignes 13-47):
   ```typescript
   useEffect(() => {
     const checkAuth = async () => {
       const user = await getAuthenticatedUser();
       if (user && user.role === "candidat") {
         router.push("/dashboard/candidat"); // ← Redirection 3
       }
     };
     checkAuth();
   }, [router]);
   ```

### Scénario de la boucle

```
1. User accède à /dashboard/candidat
2. layout.tsx vérifie → OK, rend la page
3. client-layout.tsx monte → sessionStorage vide → redirige vers /auth/login-candidate
4. Page login vérifie → user connecté → redirige vers /dashboard/candidat
5. Retour à l'étape 1 → BOUCLE INFINIE
```

## Solution appliquée

### 1. Suppression de la vérification redondante dans client-layout.tsx

**Fichier**: `facejob/app/(dashboard)/dashboard/candidat/client-layout.tsx`

**Avant**:
```typescript
// Fallback client-side check - server-side auth should handle most cases
useEffect(() => {
  if (!userData) {
    router.push(`/auth/login-candidate`);
  }
}, [userData, router]);
```

**Après**:
```typescript
// Note: Authentication is handled by the parent layout.tsx
// No need for client-side auth check here to avoid redirect loops
```

**Raison**: Le layout.tsx parent s'occupe déjà de l'authentification. La vérification client est redondante et cause la boucle.

### 2. Cache déjà en place

Le fichier `lib/auth.ts` a déjà un cache de 30 secondes pour `getAuthenticatedUser()`:

```typescript
const AUTH_CACHE_DURATION = 30000; // 30 secondes

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  // Check if we have a recent cached result
  if (lastAuthCheck && Date.now() - lastAuthCheck.timestamp < AUTH_CACHE_DURATION) {
    console.log('🔄 Using cached auth result');
    return lastAuthCheck.result;
  }
  // ...
}
```

## Architecture finale

```
┌─────────────────────────────────────┐
│  /dashboard/candidat                │
│  ├─ layout.tsx (client)             │ ← Seule vérification d'auth
│  │  └─ Vérifie token + role         │
│  └─ client-layout.tsx (client)      │
│     └─ Pas de vérification d'auth   │ ← FIX: Supprimé
│        (juste UI: sidebar, header)  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  /auth/login-candidate              │
│  └─ Vérifie si déjà connecté        │
│     └─ Redirige vers dashboard      │
└─────────────────────────────────────┘
```

## Résultat attendu

**Avant** (boucle infinie):
```
GET /dashboard/candidat 200
GET /auth/login-candidate 200
GET /dashboard/candidat 200
GET /auth/login-candidate 200
... (infini)
```

**Après** (normal):
```
GET /dashboard/candidat 200
🔄 Using cached auth result
(fin - pas de boucle)
```

## Tests à effectuer

1. **Connexion normale**:
   ```
   1. Se connecter via /auth/login-candidate
   2. Devrait rediriger vers /dashboard/candidat
   3. Vérifier qu'il n'y a pas de boucle dans les logs
   ```

2. **Navigation dans le dashboard**:
   ```
   1. Naviguer entre les pages du dashboard
   2. Devrait voir "🔄 Using cached auth result" dans la console
   3. Pas d'appels répétés à /api/v1/user
   ```

3. **Session expirée**:
   ```
   1. Supprimer le cookie authToken
   2. Rafraîchir la page
   3. Devrait rediriger vers /auth/login-candidate UNE SEULE FOIS
   ```

4. **Accès direct au dashboard sans auth**:
   ```
   1. Se déconnecter
   2. Accéder directement à /dashboard/candidat
   3. Devrait rediriger vers /auth/login-candidate UNE SEULE FOIS
   ```

## Fichiers modifiés

1. ✅ `facejob/app/(dashboard)/dashboard/candidat/client-layout.tsx`
   - Suppression de la vérification d'auth redondante (lignes 52-56)
   - Ajout d'un commentaire explicatif

## Prévention future

### Règles à suivre

1. **Une seule source de vérité pour l'authentification**:
   - ✅ layout.tsx (côté client) = source de vérité pour le dashboard candidat
   - ❌ Vérifications client redondantes = source de bugs

2. **Pas de vérification d'auth dans les composants enfants**:
   - Les layouts enfants (client-layout) ne doivent PAS vérifier l'auth
   - Ils peuvent utiliser les données user de sessionStorage pour l'UI uniquement

3. **Cache obligatoire**:
   - Toujours utiliser le cache de `getAuthenticatedUser()` (30s)
   - Ne jamais appeler directement `getUserFromToken()` dans les composants

4. **Logs pour debugging**:
   - Garder les logs "🔄 Using cached auth result"
   - Permet de vérifier que le cache fonctionne

### Pattern recommandé

```typescript
// ✅ BON: Layout parent vérifie l'auth
export default function ParentLayout({ children }) {
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getAuthenticatedUser(); // Avec cache
      if (!user) router.push("/auth/login");
    };
    checkAuth();
  }, []);
  
  return <ChildLayout>{children}</ChildLayout>;
}

// ✅ BON: Layout enfant utilise les données sans vérifier
export default function ChildLayout({ children }) {
  const userData = sessionStorage.getItem("user");
  // Pas de vérification d'auth ici!
  return <div>{children}</div>;
}

// ❌ MAUVAIS: Double vérification
export default function ChildLayout({ children }) {
  useEffect(() => {
    if (!userData) router.push("/auth/login"); // ← Cause des boucles!
  }, []);
}
```

## Problèmes similaires résolus

Ce même problème a été résolu pour:
- ✅ Dashboard Entreprise (voir `REDIRECT_LOOP_FIX.md`)
- ✅ Dashboard Candidat (ce document)

Si le problème se reproduit pour d'autres dashboards (admin, etc.), appliquer la même solution.

## Monitoring

Pour vérifier que le problème est résolu:

1. **Console du navigateur**:
   - Devrait voir "🔄 Using cached auth result" lors de la navigation
   - Pas de logs répétés de redirections

2. **Network tab**:
   - Pas de requêtes répétées à `/api/v1/user`
   - Pas de GET répétés vers les pages de login/dashboard

3. **Logs serveur**:
   - Pas de rate limiting errors
   - Pas de patterns de requêtes en boucle

## Conclusion

La boucle de redirection était causée par une **vérification d'authentification redondante** dans `client-layout.tsx`. En supprimant cette vérification et en s'appuyant uniquement sur le `layout.tsx` parent, le problème est résolu.

Le cache de 30 secondes dans `getAuthenticatedUser()` évite également les appels API répétés et le rate limiting.
