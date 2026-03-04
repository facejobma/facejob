# Améliorations Inscription et Profil Entreprise

## Modifications Apportées

### 1. Formulaire d'Inscription Entreprise

**Fichier**: `facejob/components/auth/signup/ModernSignupEntreprise.tsx`

**Nouvelle Fonctionnalité**: Question obligatoire sur l'adhésion à l'association TICO

#### Fonctionnement:
1. **Question en haut du formulaire**: "Avez-vous adhéré à l'association TICO ?"
   - Deux boutons: "Oui" (vert) et "Non" (rouge)
   - Question obligatoire - l'utilisateur doit répondre

2. **Si l'utilisateur sélectionne "Oui"**:
   - Message de confirmation vert avec icône de validation
   - L'utilisateur peut continuer l'inscription normalement

3. **Si l'utilisateur sélectionne "Non"**:
   - Affichage d'un message d'avertissement jaune
   - Affichage de l'iframe HelloAsso pour adhérer directement
   - L'utilisateur NE PEUT PAS valider l'inscription tant qu'il n'a pas adhéré
   - Message: "Vous devez adhérer à l'association TICO pour continuer votre inscription"
   - Instructions: "Après avoir adhéré, revenez sur cette page et sélectionnez 'Oui' pour continuer"

4. **Validation du formulaire**:
   - Vérifie que l'utilisateur a répondu à la question
   - Vérifie que l'utilisateur a sélectionné "Oui"
   - Bloque la soumission si "Non" est sélectionné

#### Iframe HelloAsso:
```html
<iframe 
  id="haWidget" 
  src="https://www.helloasso.com/associations/tico-transparence-information-consommateur/adhesions/adhesion-tico/widget-bouton" 
  style="width: 100%; height: 70px; border: none"
/>
```

### 2. Modal de Profil Entreprise

**Fichier**: `facejob/components/ProfileEntrepriseHeader.tsx`

**Corrections et Améliorations**:

#### A. Correction du Bug Logo
**Problème**: Le logo uploadé n'était pas associé au profil
**Solution**: 
- Changé `image` → `logo` dans la requête API
- Le backend attend le champ `logo` pour le logo de l'entreprise

#### B. Améliorations UI/UX

**1. Section Logo Améliorée**:
- Titre clair: "Logo de l'Entreprise"
- Preview du logo: 96x96px, arrondi, avec bordure verte
- Informations contextuelles: "Le logo sera visible sur votre profil public"
- Format recommandé affiché: "PNG ou JPG, taille maximale: 2MB"

**2. Bouton de Suppression Amélioré**:
- Style: Fond rouge clair avec hover
- Icône + texte: "Supprimer le logo"
- Meilleure visibilité

**3. Zone de Drop Améliorée**:
- Bordure pointillée grise qui devient verte au hover
- Fond gris clair
- Instructions claires et centrées
- Informations sur le format recommandé

**4. Indicateur de Chargement**:
- Spinner vert (cohérent avec la charte)
- Barre de progression animée
- Message: "Upload en cours..."
- Callback `onBeforeUploadBegin` pour activer l'état de chargement

**5. Feedback Utilisateur**:
- Toast de succès: "Profil mis à jour avec succès!"
- Toast d'erreur en cas de problème
- Rechargement automatique de la page après 1 seconde pour afficher les changements

**6. Boutons d'Action**:
- Bouton "Annuler": Gris avec bordure
- Bouton "Sauvegarder": Vert avec ombre
- Transitions fluides

## Structure des Données

### Formulaire d'Inscription
```typescript
{
  companyName: string;
  tel: string;
  email: string;
  password: string;
  passwordConfirm: string;
  acceptTerms: boolean;
  hasAdhered: boolean | null; // null = pas répondu, true = oui, false = non
}
```

### Mise à Jour du Profil
```typescript
{
  company_name: string;
  sector_id: string;
  adresse: string;
  site_web: string;
  created_at: string; // Format ISO
  logo: string; // URL du logo uploadé
}
```

## Flux Utilisateur

### Inscription
1. L'utilisateur arrive sur le formulaire d'inscription
2. **NOUVEAU**: Il doit répondre à la question sur l'adhésion TICO
3. S'il n'a pas adhéré:
   - Il voit l'iframe HelloAsso
   - Il adhère directement
   - Il revient et sélectionne "Oui"
4. Il remplit les autres champs
5. Il peut soumettre le formulaire

### Modification du Profil
1. L'utilisateur clique sur l'icône "Modifier" (crayon)
2. Le modal s'ouvre avec les données actuelles
3. Il peut:
   - Modifier les informations textuelles
   - Uploader un nouveau logo
   - Supprimer le logo actuel
4. Il clique sur "Sauvegarder"
5. Toast de confirmation
6. Page rechargée automatiquement

## Validation

### Inscription
- ✅ Adhésion TICO obligatoire
- ✅ Nom de l'entreprise requis
- ✅ Téléphone requis
- ✅ Email valide requis
- ✅ Mot de passe fort requis (8+ caractères, majuscule, minuscule, chiffre, caractère spécial)
- ✅ Confirmation du mot de passe
- ✅ Acceptation des conditions

### Profil
- ✅ Nom de l'entreprise
- ✅ Secteur (optionnel)
- ✅ Site web (optionnel)
- ✅ Adresse (optionnel)
- ✅ Logo (optionnel)

## Sécurité

- Token d'authentification requis pour toutes les modifications
- Validation côté client ET serveur
- Upload sécurisé via UploadThing
- Nettoyage des données avant envoi

## Accessibilité

- Labels clairs pour tous les champs
- Messages d'erreur descriptifs
- Indicateurs visuels (couleurs + icônes)
- Navigation au clavier possible
- Contraste suffisant

## Responsive Design

- Grille adaptative (1 colonne mobile, 2 colonnes desktop)
- Boutons pleine largeur sur mobile
- Iframe HelloAsso responsive
- Modal adapté aux petits écrans

## Tests Recommandés

1. **Inscription sans adhésion**: Vérifier que le formulaire est bloqué
2. **Inscription avec adhésion**: Vérifier que le formulaire fonctionne
3. **Upload de logo**: Vérifier que le logo est bien associé au profil
4. **Suppression de logo**: Vérifier que le logo est bien supprimé
5. **Modification des informations**: Vérifier que toutes les données sont mises à jour
6. **Rechargement de la page**: Vérifier que les changements persistent

## Notes Importantes

- L'iframe HelloAsso s'ajuste automatiquement en hauteur
- Le logo est stocké dans le champ `logo` (pas `image`)
- La page se recharge automatiquement après la mise à jour du profil
- L'adhésion TICO est maintenant obligatoire pour l'inscription
