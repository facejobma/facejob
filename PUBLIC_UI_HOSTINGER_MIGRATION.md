# Interface publique compatible avec la version Hostinger

Ce lot reprend l'interface publique de `main` à partir de la version `prod`, en conservant les contrats API et les parcours de production.

- Base : `prod` au commit `41e1e411c9830dda68aab885f114c27c616eccea`.
- Référence visuelle : `main` au commit `24414dee8abae5f57a9c7f0bb720574946d4bfa3`.
- Préparation : branche `codex/public-ui-hostinger`.

## Pages concernées

Accueil, À propos, Contact, FAQ, index du blog et ses trois articles, liste et détail des offres publiques. Les écrans de connexion candidat/entreprise, les inscriptions et la complétion des profils bénéficient du nouveau cadre visuel partagé.

L'accueil adopte les nouvelles sections de présentation, les cartes d'offres et le bloc newsletter. La FAQ conserve les réponses de `prod` et ajoute la recherche locale de `main`. La troisième vidéo de démonstration est un fichier statique local (`public/videos/video3.webm`, environ 9 Mo) repris de `main`.

## Fonctionnement conservé

- URL du backend configurée par `NEXT_PUBLIC_BACKEND_URL`, avec les endpoints, paramètres, corps de requêtes, validations et redirections de `prod`.
- Recherche, filtres, pagination, cache des offres et redirection vers la connexion avant candidature.
- Formulaires de contact et newsletter, connexion, inscription et vérification des comptes.
- Envoi des photos et logos au backend dans les formulaires de complétion de profil ; intégration UploadThing existante pour les CV vidéo.
- Liens actuels de navigation, notamment le lien entreprise de la barre de navigation vers `/entreprise-bientot`.
- Configuration Next.js/Hostinger, dépendances, fichiers d'environnement, routes serveur et tableaux de bord.

Les changements de proxy API, S3, AWS, IA, logique d'authentification et champs métier supplémentaires des offres présents sur `main` sont exclus. Aucune migration de base de données n'est nécessaire pour ce lot.

Les styles de blog et d'authentification sont limités à leurs conteneurs. Les couleurs des erreurs de validation restent visibles. Le bloc de filtres des offres a été adapté à l'ancienne règle de débordement mobile pour éviter un titre rogné.

## Vérification

- Compilation Next.js de production, incluant le contrôle TypeScript.
- 17 scénarios de navigateur validés, dont l'affichage de 15 routes publiques en 1365 px et en 390 px.
- Recherche et catégories de FAQ, langues FR/AR et vidéo de la page À propos, carrousel vidéo, menu mobile.
- Contact et newsletter : validation, corps des requêtes POST et retours du serveur.
- Offres : recherche, filtres secteur/métier/ville, remise à zéro, pagination et redirection de candidature.
- Connexion candidat/entreprise : validation, erreur serveur et redirection après connexion.
- Inscription candidat, inscription entreprise et complétion des deux profils avec envoi multipart d'une image.
- Comparaison des fonctions métier modifiées visuellement avec celles de la base `prod` : logique identique. Vérification des fichiers protégés de configuration, API, authentification et stockage : inchangés.

Les tests de navigateur utilisent Chrome et une API locale simulée selon les contrats de `prod`. Ils n'envoient pas de données aux services réels. La vérification sur Hostinger et auprès des fournisseurs OAuth/UploadThing reste à effectuer avant mise en ligne.

Les scripts, résultats JSON et captures de la session sont dans le dossier temporaire local `facejob-public-ui-audit`. Aucun outil de test ni dépendance supplémentaire n'a été ajouté au projet.
