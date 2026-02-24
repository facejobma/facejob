# État des pages du Dashboard Candidat

## ✅ Pages mises à jour avec useUser

| Page | Statut | Raison |
|------|--------|--------|
| `/dashboard/candidat/profile` | ✅ Fait | Utilise `user.id` pour récupérer le profil |
| `/dashboard/candidat/postuler` | ✅ Fait | Utilise `user.id` pour soumettre les candidatures |
| `/dashboard/candidat/cv` | ✅ Fait | Utilise `user` pour afficher les infos |

## ❌ Pages qui n'ont PAS besoin de useUser

| Page | Raison |
|------|--------|
| `/dashboard/candidat` (main) | Utilise uniquement le cookie pour les appels API |
| `/dashboard/candidat/historique` | Utilise uniquement le cookie pour les appels API |
| `/dashboard/candidat/offres` | Utilise uniquement le cookie pour les appels API |
| `/dashboard/candidat/support` | Composant simple sans données utilisateur |
| `/dashboard/candidat/change-password` | Utilise uniquement le cookie pour l'API |
| `/dashboard/candidat/payments` | Page vide/placeholder |
| `/dashboard/candidat/requests` | Utilise uniquement le cookie pour les appels API |

## Architecture finale

```
layout.tsx
  └─ useAuthGuard ✅ (protège TOUTES les pages)
     │
     ├─ profile/page.tsx → useUser ✅
     ├─ postuler/page.tsx → useUser ✅
     ├─ cv/page.tsx → useUser ✅
     │
     ├─ page.tsx (main) → Cookie uniquement
     ├─ historique/page.tsx → Cookie uniquement
     ├─ offres/page.tsx → Cookie uniquement
     ├─ support/page.tsx → Composant simple
     ├─ change-password/page.tsx → Cookie uniquement
     ├─ payments/page.tsx → Page vide
     └─ requests/page.tsx → Cookie uniquement
```

## Quand utiliser useUser vs Cookie

### Utiliser `useUser` quand:
- ✅ Vous avez besoin de `user.id`, `user.email`, `user.first_name`, etc.
- ✅ Vous affichez des informations utilisateur dans l'UI
- ✅ Vous devez passer `user.id` dans le body d'une requête

### Utiliser juste le `Cookie` quand:
- ✅ Vous faites uniquement des appels API avec le token dans le header
- ✅ Vous n'avez pas besoin des données utilisateur
- ✅ Le backend identifie l'utilisateur via le token

## Exemple de code

### Avec useUser (quand on a besoin des données)
```typescript
import { useUser } from '@/hooks/useUser';

export default function MyPage() {
  const { user, isLoading } = useUser();

  if (isLoading) return <Loading />;

  return <div>Bonjour {user?.first_name}!</div>;
}
```

### Sans useUser (juste le cookie)
```typescript
import Cookies from 'js-cookie';

export default function MyPage() {
  const authToken = Cookies.get('authToken');

  useEffect(() => {
    fetch('/api/data', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
  }, []);

  return <div>Ma page</div>;
}
```

## Résultat

✅ Toutes les pages du dashboard candidat sont maintenant correctement configurées!
✅ Plus de problèmes avec sessionStorage vide
✅ Les données utilisateur sont récupérées automatiquement du backend si nécessaire
✅ Architecture claire et maintenable
