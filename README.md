#  Plateforme de gestion scolaire – Documentation projet

Bienvenue dans la documentation de notre plateforme de gestion scolaire moderne. Ce projet est composé d’un **frontend React** et d’un **backend Laravel**. Il propose une authentification sécurisée, une détection automatique des rôles (sans champ `role` dans la table `users`) et des interfaces dédiées pour chaque type d’utilisateur : étudiant, enseignant, administrateur.

---

##  Fonctionnalités principales

###  Authentification

- **Inscription** (`/register`)  
  Formulaire classique (nom, email, mot de passe). Un utilisateur est créé dans `users` **sans aucun rôle**.
- **Connexion** (`/login`)  
  Authentification via email + mot de passe. Le serveur génère un token **Sanctum**.
- **Détection automatique du type** (sans colonne `role`)  
  Le backend vérifie l’existence d’une entrée dans les tables :
  - `administrateurs` → rôle = `admin`
  - `enseignants` → rôle = `enseignant`
  - `etudiants` → rôle = `etudiant`
  - Sinon → utilisateur par défaut.
- **Redirection intelligente**  
  Chaque utilisateur est redirigé vers son espace spécifique après connexion.

---

##  Interfaces utilisateur

###  Page d’accueil (`/accueil`)

Accessible aux utilisateurs sans rôle spécifique. Elle contient :

- Bannière de bienvenue personnalisée.
- Présentation de l’établissement (historique, effectifs, taux de réussite, nombre d’enseignants).
- Widgets d’accès rapide (emploi du temps, liste des groupes, reglement interieur , contact).
- Mode sombre / clair (persistant via `localStorage`).

### Espace étudiant (`/etudiant/:id`)

- **Mon profil** : nom, prénom, date de naissance, classe, email.
- **Mes notes** : tableau des notes par matière, calcul de la moyenne générale.
- **Mes absences** : liste des absences (date, matière, nombre d’heures, justification).
- **Attestation scolaire** : génération d’un PDF officiel avec les informations personnelles, classe, remarque administrative.
- **Changement de mot de passe** (modal sécurisé).
- **Export PDF** : génère un relevé complet (infos personnelles, notes, absences) avec un design professionnel (Tailwind + impression).
- **Mode sombre** intégré.

###  Espace enseignant (`/enseignant/:id`)

- **Mon profil** : nom (pas de prénom), matière enseignée, coefficient de la matière (affiché en lecture seule), email, nombre de classes affectées.
- **Tableau de bord** : vue d’ensemble des classes, étudiants, notes saisies et absences enregistrées.
- **Mes classes** : liste des classes auxquelles l’enseignant est associé. Un clic sur une classe affiche la liste des étudiants.
- **Gestion des notes** :
  - Sélection d’une classe → affichage de ses étudiants.
  - Clic sur un étudiant pour voir ses trois contrôles (Contrôle 1, 2, 3).
  - Ajout / modification / suppression d’une note (type de contrôle, note).
  - Impression du relevé de notes (tableau des contrôles par étudiant).
- **Gestion des absences** :
  - Sélection d’une classe → affichage de ses étudiants.
  - Clic sur un étudiant pour voir ses absences (date, nombre d’heures, justification).
  - Ajout / modification / suppression d’une absence.
- **Emploi du temps** : tableau hebdomadaire des cours (statique).
- **Mode sombre** intégré.
- **Déconnexion** via le menu utilisateur.

### Espace administrateur (`/admin/dashboard`)

- **Tableau de bord** : statistiques globales (utilisateurs totaux, étudiants, enseignants, administrateurs, classes, notes, absences, messages de contact).
- **Gestion des utilisateurs** :
  - **Étudiants** : liste, ajout, modification, suppression (nom, prénom, email, classe, date de naissance).
  - **Enseignants** : liste, ajout, modification, suppression (nom, email, matière, coefficient). Pas de prénom.
  - **Administrateurs** : liste, ajout, modification, suppression (nom, email). Seulement la colonne `user_id` en base.
  - **Utilisateurs sans rôle** : liste des utilisateurs non encore affectés, avec boutons pour leur attribuer un rôle (étudiant, enseignant, admin).
- **Gestion des classes** : création, modification, suppression, consultation des étudiants par classe (uniquement les noms).
- **Gestion des notes** : par classe, affichage des étudiants avec leurs trois contrôles (tableau matière, contrôle 1, 2, 3, moyenne). Impression des bulletins (un PDF par étudiant, avec ses notes et moyenne générale). Possibilité d’ajouter/modifier/supprimer des notes.
- **Gestion des absences** : par classe, consultation des absences par étudiant. Modification de la justification (case à cocher). Suppression.
- **Affectation des enseignants aux classes** (table pivot `classe_enseignant`) : liste des classes et des enseignants affectés, possibilité de modifier l’affectation.
- **Messages de contact** : consultation et suppression des messages envoyés via le formulaire de contact.
- **Mode sombre** intégral.
- **Déconnexion** via le menu utilisateur.

##  Architecture technique

###  Backend (Laravel 12)

- **Authentification** : Laravel Sanctum (tokens).
- **Base de données** : MySQL / MariaDB.
- **Tables principales** :
  - `users` (id, name, email, password) – **pas de colonne `role`**.
  - `administrateurs` (user_id)
  - `enseignants` (user_id, nom, matiere)
  - `etudiants` (user_id, nom, prenom, dateNaissance, classe_id)
  - `notes` (etudiant_id, matiere, note)
  - `absences` (etudiant_id, date, enseignant_id, nb_heures, justifiee)
  - `classes` (nom) – relation avec les étudiants.
  - `contact`(nom , email, sujet, message)
- **CORS** : configuré pour autoriser `http://localhost:3000`.

###  Frontend (React 18 + Tailwind CSS)

- **Routes** : react-router-dom (pages Login, Register, Espaces utilisateurs, Accueil).
- **Gestion d’état** : hooks React (`useState`, `useEffect`).
- **Appels API** : Axios avec intercepteur pour ajouter le token `Bearer`.
- **Icônes** : Lucide React.
- **Mode sombre** : bascule avec classe `dark` sur `<html>`, stockée dans `localStorage`.

###  Sécurité

- Toutes les routes API (`/api/*`) sont protégées par `auth:sanctum`.
- Le frontend stocke le token dans `localStorage` et l’envoie dans l’entête `Authorization`.
- Les mots de passe sont hachés (`bcrypt`).

---

## Installation rapide (environnement de développement)

### Backend

```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
# Configurer la base de données dans .env
php artisan migrate --seed
php artisan serve
```

### Frontend
```bash
cd Frontend
npm install
npm run dev

```