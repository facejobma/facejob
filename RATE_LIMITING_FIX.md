# Fix: Boucle infinie de requêtes /api/v1/user

## Problème identifié

L'application déclenchait une boucle infinie de requêtes vers `/api/v1/user`, causant un rate limiting avec l'erreur :
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "error_code": "RATE_LIMITED",
  "retry_after": 24
}
```

### Causes principales

1. **Navigation Next.js avec RSC** : Les paramètres `_rsc` dans les URLs indiquent des navigations client-side qui rechargent les Server Components
2. **ServerAuthGuard** : Appelé à chaque navigation, il faisait un appel API à chaque fois sans cache
3. **Pas de cache côté serveur** : Chaque requête RSC déclenchait une nouvelle vérification d'authentification
4. **Rate limiting strict** : 200 requêtes/minute pour les utilisateurs authentifiés, rapidement dépassé

## Solutions implémentées

### 1. Cache côté serveur (ServerAuthGuard)

**Fichier** : `facejob/components/auth/ServerAuthGuard.tsx`

- Ajout d'un cache Map avec TTL de 30 secondes
- Réutilisation des données utilisateur en cache pour le même token
- Réduction drastique des appels API répétés

```typescript
const userCache = new Map<string, { user: AuthUser | null; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 secondes
```

### 2. Cache côté client optimisé

**Fichier** : `facejob/lib/auth.ts`

- Augmentation du cache de 5s à 30s
- Meilleure gestion des appels simultanés
- Prévention des appels redondants

```typescript
const AUTH_CACHE_DURATION = 30000; // 30 secondes (augmenté de 5s)
```

### 3. Hook useAuth personnalisé

**Fichier** : `facejob/hooks/useAuth.tsx`

- Hook React optimisé pour l'authentification
- Évite les re-renders inutiles
- Une seule vérification par montage de composant

### 4. Rate limiting adapté pour /api/v1/user

**Fichier** : `facejobBackend/app/Http/Middleware/GlobalRateLimiting.php`

- Endpoint `/api/v1/user` exclu du rate limiting global strict
- Limite spécifique plus élevée : 300 requêtes/minute pour les utilisateurs authentifiés
- Messages d'erreur plus informatifs avec `retry_after`

## Résultats attendus

- ✅ Réduction de 80-90% des appels à `/api/v1/user`
- ✅ Pas de rate limiting pour une utilisation normale
- ✅ Navigation fluide entre les pages du dashboard
- ✅ Meilleure performance globale de l'application

## Recommandations supplémentaires

1. **Monitoring** : Surveiller les logs pour vérifier la réduction des appels
2. **Cache Redis** : Pour une application en production avec plusieurs serveurs, considérer Redis pour le cache partagé
3. **Session storage** : Utiliser davantage sessionStorage pour les données utilisateur côté client
4. **Optimisation RSC** : Évaluer si tous les layouts doivent être des Server Components

## Tests à effectuer

1. Naviguer entre plusieurs pages du dashboard rapidement
2. Vérifier les logs backend pour les appels à `/api/v1/user`
3. Ouvrir les DevTools Network et filtrer par "user" pour voir la fréquence des appels
4. Tester avec plusieurs onglets ouverts simultanément
