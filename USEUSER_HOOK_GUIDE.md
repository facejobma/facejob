# Guide: Hook useUser pour les pages du dashboard

## Concept

Le système d'authentification est maintenant en deux couches:

1. **`useAuthGuard`** dans `layout.tsx` → Protège toutes les pages (vérifie auth + rôle)
2. **`useUser`** dans chaque page → Récupère les données utilisateur

## Architecture

```
┌─────────────────────────────────────────────┐
│  layout.tsx                                 │
│  └─ useAuthGuard (vérifie auth + rôle)     │ ← Une seule fois
│     ✅ Token valide? ✅ Bon rôle?           │
│                                             │
│     ┌───────────────────────────────────┐  │
│     │  page.tsx                         │  │
│     │  └─ useUser (récupère données)    │  │ ← Dans chaque page
│     │     📦 Données utilisateur         │  │
│     └───────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Hook useUser

### Fonctionnalités

- ✅ Vérifie d'abord sessionStorage (rapide)
- ✅ Si vide, récupère du backend avec le cookie
- ✅ Sauvegarde dans sessionStorage pour les prochaines fois
- ✅ Retourne `{ user, isLoading, error, refetch }`

### Utilisation

```typescript
import { useUser } from '@/hooks/useUser';

export default function MyPage() {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div>
      <h1>Bonjour {user?.first_name}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

## Exemples d'utilisation

### 1. Page Profile (déjà fait)

```typescript
const Profile = () => {
  const { user, isLoading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch profile data using user.id
    fetchProfile(user.id);
  }, [user]);

  // ...
};
```

### 2. Page Dashboard

```typescript
const Dashboard = () => {
  const { user, isLoading } = useUser();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Dashboard de {user?.first_name}</h1>
      <Stats userId={user?.id} />
    </div>
  );
};
```

### 3. Page avec API calls

```typescript
const MyPage = () => {
  const { user } = useUser();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/data?userId=${user.id}`)
      .then(res => res.json())
      .then(setData);
  }, [user]);

  // ...
};
```

## Pages à mettre à jour

Toutes les pages du dashboard candidat qui utilisent les données utilisateur:

### ✅ Déjà fait
- `/dashboard/candidat/profile` - Utilise `useUser`

### 🔄 À faire (si nécessaire)

1. **`/dashboard/candidat/page.tsx`** (Dashboard principal)
   - Affiche le nom de l'utilisateur
   - Statistiques personnalisées

2. **`/dashboard/candidat/postuler/page.tsx`**
   - Utilise `user.id` pour soumettre les candidatures

3. **`/dashboard/candidat/offres/page.tsx`**
   - Peut afficher des offres personnalisées

4. **`/dashboard/candidat/historique/page.tsx`**
   - Affiche l'historique de l'utilisateur

5. **`/dashboard/candidat/cv/page.tsx`**
   - Gère les CV de l'utilisateur

## Migration d'une page existante

### Avant (ancien code)

```typescript
const MyPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Problème: Si sessionStorage vide, user reste null!
};
```

### Après (avec useUser)

```typescript
import { useUser } from '@/hooks/useUser';

const MyPage = () => {
  const { user, isLoading } = useUser();

  if (isLoading) return <LoadingSpinner />;

  // user est toujours disponible, même si sessionStorage était vide!
};
```

## Avantages

1. **Code plus simple** - Plus besoin de gérer sessionStorage manuellement
2. **Toujours à jour** - Récupère du backend si sessionStorage vide
3. **Performance** - Cache dans sessionStorage pour éviter les appels répétés
4. **Réutilisable** - Un seul hook pour toutes les pages
5. **Type-safe** - TypeScript pour les données utilisateur

## Quand NE PAS utiliser useUser

- ❌ Dans les composants qui ne sont pas dans une route protégée
- ❌ Dans les layouts (utiliser useAuthGuard à la place)
- ❌ Dans les pages publiques (login, home, etc.)

## Quand utiliser useUser

- ✅ Dans toutes les pages du dashboard
- ✅ Dans les composants qui affichent des infos utilisateur
- ✅ Dans les pages qui font des appels API avec user.id

## Debugging

Si `useUser` ne retourne pas de données:

1. Vérifier que le cookie `authToken` existe:
   ```javascript
   console.log('Cookie:', document.cookie);
   ```

2. Vérifier les logs du hook:
   ```typescript
   const { user, isLoading, error } = useUser();
   console.log('User:', user, 'Loading:', isLoading, 'Error:', error);
   ```

3. Vérifier la réponse du backend:
   ```
   Network tab → /api/v1/user → Response
   ```

## Conclusion

Le hook `useUser` simplifie la récupération des données utilisateur dans toutes les pages du dashboard. Il gère automatiquement le cache sessionStorage et récupère du backend si nécessaire.

**Règle simple**: 
- `useAuthGuard` dans le layout = Protection
- `useUser` dans les pages = Données
