# Fix: Authentification pour l'endpoint /offres

## Date: 2026-02-28

## Problème

L'endpoint `/api/v1/offres` ne recevait pas le token d'authentification, donc le backend ne pouvait pas identifier l'utilisateur connecté pour déterminer quelles offres avaient déjà été postulées (`has_applied` flag).

## Solution

### 1. Frontend - Envoi du token d'authentification

**Fichier**: `facejob/lib/api.ts`

Changé `fetchOffers()` de `publicApiCall` à `authenticatedApiCall`:

```typescript
// Avant
export async function fetchOffers(page: number = 1, perPage: number = 15) {
  const response = await publicApiCall(`/offres?page=${page}&per_page=${perPage}`);
  // ...
}

// Après
export async function fetchOffers(page: number = 1, perPage: number = 15) {
  const response = await authenticatedApiCall(`/offres?page=${page}&per_page=${perPage}`);
  // ...
}
```

**Impact**: Maintenant, chaque requête vers `/offres` inclut le header `Authorization: Bearer [TOKEN]`

### 2. Frontend - Logs de débogage

**Fichier**: `facejob/app/(dashboard)/dashboard/candidat/offres/page.tsx`

Ajouté des logs pour tracer l'authentification:

```typescript
console.log('🔐 Fetching offers with auth:', {
  hasToken: !!authToken,
  userId: userId,
  tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : 'none'
});

console.log('📊 Offers result:', {
  totalOffers: offersResult.data?.length || 0,
  sampleHasApplied: offersResult.data?.[0]?.has_applied,
  pagination: offersResult.pagination
});
```

### 3. Backend - Amélioration de la détection d'utilisateur

**Fichier**: `facejobBackend/app/Http/Controllers/OffreController.php`

Amélioré la méthode `getAll()` pour mieux détecter l'utilisateur authentifié:

```php
// Utilise $request->user() au lieu de auth()->user()
$user = $request->user();

// Vérifie le type d'utilisateur avec instanceof ET get_class()
if ($user && ($user instanceof \App\Models\Candidat || get_class($user) === 'App\Models\Candidat')) {
    // Récupère les offres postulées
    $appliedOfferIds = PostulerOffre::where('candidat_id', $user->id)
        ->pluck('offre_id')
        ->toArray();
}
```

**Logs ajoutés**:
- `User authentication check in getAll` - Type d'utilisateur et table
- `Applied offers retrieved successfully` - IDs des offres postulées
- `User is not a Candidat` - Si l'utilisateur n'est pas un candidat
- `No authenticated user` - Si aucun utilisateur authentifié

## Comment ça fonctionne maintenant

### Flux d'authentification

1. **Page chargée**: `/dashboard/candidat/offres`
2. **Token récupéré**: Depuis `Cookies.get("authToken")`
3. **Requête envoyée**: `GET /api/v1/offres?page=1&per_page=15` avec header `Authorization: Bearer [TOKEN]`
4. **Backend**:
   - Reçoit le token via Sanctum middleware
   - Identifie l'utilisateur avec `$request->user()`
   - Vérifie si c'est un Candidat
   - Récupère les IDs des offres postulées depuis `postuler_offres`
   - Ajoute le flag `has_applied` à chaque offre
5. **Frontend**:
   - Reçoit les offres avec `has_applied: true/false`
   - Affiche "Déjà postulé" ou "Postuler maintenant"

### Logs à vérifier

#### Console du navigateur (DevTools)
```
🔐 Fetching offers with auth: {
  hasToken: true,
  userId: 123,
  tokenPreview: "1|abcdefghijklmnop..."
}

📊 Offers result: {
  totalOffers: 15,
  sampleHasApplied: true,
  pagination: { current_page: 1, total: 45, ... }
}
```

#### Logs Laravel (`storage/logs/laravel.log`)
```
[2026-02-28] User authentication check in getAll
{
  "user_id": 123,
  "user_type": "App\\Models\\Candidat",
  "is_candidat_instance": true,
  "table_name": "candidats"
}

[2026-02-28] Applied offers retrieved successfully
{
  "candidat_id": 123,
  "applied_offer_ids": [12, 15, 18],
  "total_applications": 3,
  "sample_query_result": { "id": 45, "candidat_id": 123, "offre_id": 12, ... }
}
```

## Vérification

### 1. Vérifier que le token est envoyé

Ouvrir DevTools → Network → Chercher la requête `/offres`:

```
Request Headers:
Authorization: Bearer 1|abcdefghijklmnopqrstuvwxyz...
Content-Type: application/json
Accept: application/json
```

### 2. Vérifier la réponse

Dans la réponse JSON, chaque offre doit avoir:

```json
{
  "id": 12,
  "titre": "Développeur Full Stack",
  "has_applied": true,  // ← Ce champ doit être présent
  ...
}
```

### 3. Vérifier les logs backend

```bash
# Voir les logs en temps réel
tail -f facejobBackend/storage/logs/laravel.log | grep "getAll"
```

### 4. Test manuel

```bash
# Remplacer [TOKEN] par votre token
curl -X GET "https://api.facejob.ma/api/v1/offres?page=1&per_page=5" \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" | jq '.data[0].has_applied'
```

Devrait retourner `true` ou `false`.

## Différence avec check-application-status

### Ancien système (inefficace)
- 1 requête pour récupérer les offres
- 15 requêtes pour vérifier chaque offre individuellement
- **Total: 16 requêtes**

### Nouveau système (optimisé)
- 1 requête pour récupérer les offres avec `has_applied` inclus
- **Total: 1 requête**

L'endpoint `/check-application-status` existe toujours mais n'est plus utilisé pour la liste des offres.

## Compatibilité

L'endpoint `/offres` reste accessible publiquement (sans authentification) pour les visiteurs non connectés. Dans ce cas:
- `$request->user()` retourne `null`
- `has_applied` est toujours `false` pour toutes les offres
- Aucune erreur n'est générée

## Notes importantes

- Le token doit être valide et associé à un modèle `Candidat`
- Si le token est expiré ou invalide, `has_applied` sera `false` pour toutes les offres
- Les logs permettent de diagnostiquer rapidement les problèmes d'authentification
- La route `/offres` n'est pas protégée par middleware, l'authentification est optionnelle
