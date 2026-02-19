# Fix: Boucle de redirection infinie

## Problème identifié

L'application créait une boucle infinie de redirections entre 3 routes :
1. `/dashboard/entreprise` → redirige vers `/dashboard/entreprise/dashboard`
2. `/dashboard/entreprise/dashboard` → vérifié par ServerAuthGuard
3. `/auth/login-entreprise` → vérifie l'auth et redirige vers dashboard

### Logs observés
```
GET /dashboard/entreprise 200 in 62ms
GET /dashboard/entreprise/dashboard 200 in 217ms
GET /auth/login-entreprise 200 in 214ms
GET /dashboard/entreprise/dashboard 200 in 207ms
GET /auth/login-entreprise 200 in 150ms
[ServerAuthGuard] Using cached user data
GET /dashboard/entreprise 200 in 56ms
... (répété à l'infini)
```

### Causes

1. **Redirection inutile** : `/dashboard/entreprise/page.tsx` redirige immédiatement vers `/dashboard/entreprise/dashboard`
2. **Double vérification d'auth** : 
   - ServerAuthGuard (côté serveur) vérifie l'auth
   - Page login (côté client) vérifie aussi l'auth
3. **Navigation RSC** : Chaque redirection déclenche un nouveau rendu des Server Components
4. **Pas de garde contre les re-renders** : Les useEffect se déclenchent à chaque navigation

## Solutions implémentées

### 1. Fusion des pages dashboard

**Fichier modifié** : `facejob/app/(dashboard)/dashboard/entreprise/page.tsx`

- Suppression de la redirection vers `/dashboard/entreprise/dashboard`
- Déplacement du contenu du dashboard directement dans `/dashboard/entreprise`
- Suppression du dossier `/dashboard/entreprise/dashboard/`

**Avant** :
```typescript
export default function EntrepriseDashboardPage() {
  redirect('/dashboard/entreprise/dashboard');
}
```

**Après** :
```typescript
export default function EntrepriseDashboardPage() {
  return <Dashboard />;
}
```

### 2. Mise à jour de la navigation

**Fichier modifié** : `facejob/constants/data.ts`

```typescript
// Avant
href: "/dashboard/entreprise/dashboard"

// Après
href: "/dashboard/entreprise"
```

### 3. Optimisation de la page login

**Fichier modifié** : `facejob/app/auth/login-entreprise/page.tsx`

- Ajout d'un `useRef` pour éviter les vérifications multiples
- Protection contre les re-renders inutiles

```typescript
const hasChecked = useRef(false);

useEffect(() => {
  if (hasChecked.current) {
    return; // Évite les vérifications répétées
  }
  hasChecked.current = true;
  // ... reste du code
}, [router]);
```

### 4. Cache optimisé (déjà implémenté)

Les changements précédents sur le cache sont toujours actifs :
- Cache serveur de 30s dans ServerAuthGuard
- Cache client de 30s dans lib/auth.ts
- Hook useAuth optimisé

## Résultats attendus

### Avant le fix
- Boucle infinie de redirections
- 3 routes chargées en boucle
- Centaines de requêtes par minute
- Rate limiting déclenché

### Après le fix
- Une seule route : `/dashboard/entreprise`
- Pas de redirection inutile
- Vérification d'auth une seule fois
- Navigation fluide

## Architecture finale

```
/dashboard/entreprise (page principale avec stats)
├── /candidats
├── /mes-offres
├── /publier
├── /services
└── /profile
```

Plus de `/dashboard/entreprise/dashboard` !

## Tests à effectuer

1. **Navigation directe**
   ```
   Aller sur https://www.facejob.ma/dashboard/entreprise
   → Devrait afficher le dashboard directement
   ```

2. **Vérifier les logs**
   ```
   Ouvrir la console Next.js
   → Ne devrait plus voir de boucle de GET répétés
   ```

3. **Vérifier le cache**
   ```
   Naviguer entre les pages du dashboard
   → Devrait voir "[ServerAuthGuard] Using cached user data"
   → Pas d'appels répétés à /api/v1/user
   ```

4. **Tester la sidebar**
   ```
   Cliquer sur "Statistiques" dans la sidebar
   → Devrait aller sur /dashboard/entreprise
   → Pas de redirection visible
   ```

## Nettoyage nécessaire

Si vous avez des liens hardcodés vers `/dashboard/entreprise/dashboard` ailleurs dans le code :

```bash
# Rechercher les références
cd facejob
grep -r "dashboard/entreprise/dashboard" .
```

Remplacez-les par `/dashboard/entreprise`

## Notes importantes

- Le cache de 30s est suffisant pour une utilisation normale
- Si vous modifiez les données utilisateur, pensez à invalider le cache
- En production, considérez Redis pour un cache partagé entre serveurs
