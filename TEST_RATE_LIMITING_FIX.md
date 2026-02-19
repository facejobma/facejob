# Guide de test : Fix Rate Limiting

## Avant de tester

Assurez-vous que :
1. Le backend Laravel est démarré
2. Le frontend Next.js est démarré
3. Vous êtes connecté en tant qu'entreprise

## Tests à effectuer

### Test 1 : Navigation normale

1. Connectez-vous au dashboard entreprise
2. Naviguez entre les pages suivantes rapidement :
   - `/dashboard/entreprise`
   - `/dashboard/entreprise/candidats`
   - `/dashboard/entreprise/mes-offres`
   - `/dashboard/entreprise/publier`
   - `/dashboard/entreprise/services`

**Résultat attendu** : Aucune erreur de rate limiting, navigation fluide

### Test 2 : Vérifier les appels API

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet Network
3. Filtrez par "user" dans la barre de recherche
4. Naviguez entre plusieurs pages du dashboard

**Résultat attendu** : 
- Maximum 1-2 appels à `/api/v1/user` toutes les 30 secondes
- Pas d'appels répétés en boucle
- Status 200 pour tous les appels

### Test 3 : Rafraîchissement de page

1. Sur une page du dashboard, appuyez sur F5 plusieurs fois rapidement
2. Vérifiez la console pour les erreurs

**Résultat attendu** : Pas d'erreur 429 (Too Many Requests)

### Test 4 : Plusieurs onglets

1. Ouvrez 3-4 onglets avec différentes pages du dashboard
2. Naviguez dans chaque onglet
3. Vérifiez qu'aucun onglet ne montre d'erreur

**Résultat attendu** : Tous les onglets fonctionnent normalement

### Test 5 : Vérifier les logs backend

Dans le terminal du backend Laravel, vérifiez :

```bash
# Chercher les logs de rate limiting
tail -f storage/logs/laravel.log | grep "Rate limit"
```

**Résultat attendu** : Beaucoup moins de logs "Rate limit exceeded"

## Vérification des performances

### Avant le fix
- ~50-100 appels à `/api/v1/user` par minute
- Erreur 429 après quelques navigations
- Message : "Too many requests. Please try again later."

### Après le fix
- ~2-5 appels à `/api/v1/user` par minute
- Pas d'erreur 429
- Navigation fluide

## En cas de problème

Si vous rencontrez toujours des erreurs :

1. **Vider le cache du navigateur**
   ```
   Ctrl + Shift + Delete
   ```

2. **Redémarrer le backend**
   ```bash
   cd facejobBackend
   php artisan cache:clear
   php artisan config:clear
   php artisan serve
   ```

3. **Redémarrer le frontend**
   ```bash
   cd facejob
   npm run dev
   ```

4. **Vérifier les variables d'environnement**
   - `NEXT_PUBLIC_BACKEND_URL` doit pointer vers le bon backend
   - Le backend doit avoir `APP_ENV=local` et `APP_DEBUG=true` en développement

## Monitoring en production

Pour surveiller en production :

1. **Logs Laravel**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Logs de sécurité**
   ```bash
   tail -f storage/logs/security.log
   ```

3. **Métriques à surveiller**
   - Nombre de requêtes à `/api/v1/user` par minute
   - Taux d'erreurs 429
   - Temps de réponse moyen
