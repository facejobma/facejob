# 🎨 Guide de Typographie FaceJob

## Polices Utilisées

### 1. **Inter** - Police de Titres
- **Usage** : Tous les titres (h1, h2, h3, h4, h5, h6)
- **Poids** : 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- **Caractéristiques** : Moderne, géométrique, excellente lisibilité sur écran
- **Classes Tailwind** : `font-heading`

### 2. **Manrope** - Police de Corps
- **Usage** : Texte principal, paragraphes, descriptions
- **Poids** : 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- **Caractéristiques** : Chaleureuse, arrondie, très lisible
- **Classes Tailwind** : `font-body` ou `font-sans` (par défaut)

### 3. **Space Grotesk** - Police d'Accent
- **Usage** : Boutons, CTA, éléments importants
- **Poids** : 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Caractéristiques** : Distinctive, moderne, attire l'attention
- **Classes Tailwind** : `font-accent`

---

## 📝 Exemples d'Utilisation

### Titres
```tsx
<h1 className="font-heading text-5xl font-bold">
  Trouvez votre emploi idéal
</h1>

<h2 className="font-heading text-3xl font-semibold text-secondary">
  Comment ça marche ?
</h2>
```

### Corps de Texte
```tsx
<p className="font-body text-base text-gray-600">
  FaceJob révolutionne le recrutement avec les CV vidéo.
</p>

<div className="font-sans text-sm leading-relaxed">
  Description détaillée...
</div>
```

### Boutons et CTA
```tsx
<button className="font-accent font-semibold text-lg">
  Créer mon CV vidéo
</button>

<Link href="/offres" className="font-accent font-bold">
  Voir les offres
</Link>
```

---

## 🎯 Hiérarchie Typographique

| Élément | Police | Taille | Poids | Usage |
|---------|--------|--------|-------|-------|
| H1 Hero | Inter | 3.5-4rem | 800 | Page d'accueil principale |
| H1 | Inter | 2.5-3rem | 700 | Titres de page |
| H2 | Inter | 2-2.5rem | 700 | Sections principales |
| H3 | Inter | 1.5-2rem | 600 | Sous-sections |
| H4 | Inter | 1.25rem | 600 | Titres de cartes |
| Body Large | Manrope | 1.125rem | 400 | Texte important |
| Body | Manrope | 1rem | 400 | Texte standard |
| Body Small | Manrope | 0.875rem | 400 | Texte secondaire |
| Button | Space Grotesk | 1rem | 600 | Boutons principaux |
| Caption | Manrope | 0.75rem | 500 | Légendes, notes |

---

## ✅ Bonnes Pratiques

### 1. Contraste et Lisibilité
- Toujours assurer un ratio de contraste minimum de 4.5:1
- Utiliser `text-gray-900` pour le texte principal
- Utiliser `text-gray-600` pour le texte secondaire

### 2. Espacement des Lettres
```css
/* Titres */
letter-spacing: -0.02em; /* Légèrement serré */

/* Boutons */
letter-spacing: -0.01em; /* Très légèrement serré */

/* Corps */
letter-spacing: normal; /* Espacement par défaut */
```

### 3. Hauteur de Ligne
```tsx
<p className="leading-relaxed">  {/* 1.625 */}
<p className="leading-normal">   {/* 1.5 */}
<p className="leading-tight">    {/* 1.25 - pour titres */}
```

### 4. Responsive
```tsx
{/* Mobile → Desktop */}
<h1 className="text-3xl md:text-4xl lg:text-5xl font-heading">
  Titre Responsive
</h1>
```

---

## 🚀 Migration depuis les Anciennes Polices

### Remplacement Automatique
Les anciennes classes sont mappées automatiquement :
- `font-poppins` → utilise maintenant Manrope
- `font-default` → utilise maintenant Inter
- `font-inter` → utilise toujours Inter

### Recommandations de Migration
```tsx
// ❌ Ancien
<h2 className="font-default">Titre</h2>
<p className="font-poppins">Texte</p>

// ✅ Nouveau (recommandé)
<h2 className="font-heading">Titre</h2>
<p className="font-body">Texte</p>

// ✅ Ou simplement (utilise les valeurs par défaut)
<h2>Titre</h2>  {/* Utilise automatiquement font-heading */}
<p>Texte</p>    {/* Utilise automatiquement font-body */}
```

---

## 🎨 Exemples Complets

### Card de Candidat
```tsx
<div className="bg-white rounded-lg p-6 shadow-md">
  <h3 className="font-heading text-xl font-semibold text-secondary mb-2">
    Ahmed Benali
  </h3>
  <p className="font-body text-sm text-gray-600 mb-4">
    Développeur Full Stack • 5 ans d'expérience
  </p>
  <button className="font-accent font-semibold text-white bg-primary px-6 py-2 rounded-lg">
    Voir le profil
  </button>
</div>
```

### Section Hero
```tsx
<section className="hero">
  <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-secondary leading-tight mb-6">
    Recrutez avec des CV Vidéo
  </h1>
  <p className="font-body text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
    La première plateforme marocaine qui révolutionne le recrutement
  </p>
  <button className="font-accent font-bold text-lg px-8 py-4 bg-primary text-white rounded-lg">
    Commencer Gratuitement
  </button>
</section>
```

---

## 📊 Performance

Les polices sont chargées avec `display=swap` pour :
- ✅ Éviter le FOIT (Flash of Invisible Text)
- ✅ Améliorer le First Contentful Paint
- ✅ Meilleure expérience utilisateur

---

## 🔗 Ressources

- [Inter sur Google Fonts](https://fonts.google.com/specimen/Inter)
- [Manrope sur Google Fonts](https://fonts.google.com/specimen/Manrope)
- [Space Grotesk sur Google Fonts](https://fonts.google.com/specimen/Space+Grotesk)
- [Guide d'accessibilité WCAG](https://www.w3.org/WAI/WCAG21/quickref/)
