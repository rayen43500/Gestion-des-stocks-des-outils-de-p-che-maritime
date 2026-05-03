# Documentation du Projet : Gestion des Stocks des Outils de Pêche Maritime

Ce projet est une application web complète (SaaS) dédiée à la gestion de l'inventaire des outils de pêche maritime. Il permet de suivre les produits, les fournisseurs, les clients, les commandes, les livraisons, les factures et les paiements, tout en offrant des statistiques détaillées et un système de traçabilité par code-barres.

## Architecture Globale

L'application suit une architecture client-serveur classique :
- **Frontend** : Développé avec React, TypeScript et Vite.
- **Backend** : Développé avec Node.js, Express et MongoDB.

---

## 1. Backend (Serveur)

Le backend gère la logique métier, l'authentification et l'accès à la base de données.

### Fichiers principaux :
- **`index.js`** : Point d'entrée de l'application. Il configure le serveur Express, les middlewares (CORS, JSON), connecte la base de données et définit les routes principales.
- **`src/config/db.js`** : Gère la connexion à MongoDB via Mongoose.
- **`src/utils/seed.js`** : Script permettant d'initialiser la base de données avec des données de test (administrateur, produits, etc.).

### Modèles (Données) - `src/models/` :
- **`User.js`** : Gère les utilisateurs et l'authentification (email, mot de passe haché).
- **`Product.js`** : Définit la structure d'un produit (nom, prix, quantité, catégorie, **code-barres**, etc.).
- **`Supplier.js`** : Gère les fournisseurs et les produits qu'ils fournissent.
- **`Client.js`** : Gère les informations des clients.
- **`Order.js`** : Gère les commandes passées par les clients.
- **`Delivery.js`** : Suit les livraisons liées aux commandes.
- **`Invoice.js`** : Gère la facturation liée aux commandes.
- **`Payment.js`** : Suit les paiements effectués sur les factures.
- **`StockMovement.js`** : Enregistre chaque entrée ou sortie de stock pour une traçabilité totale.

### Routes (API) - `src/routes/` :
- **`auth.routes.js`** : Inscription, connexion et réinitialisation de mot de passe.
- **`products.routes.js`** : CRUD complet sur les produits et recherche par code-barres.
- **`suppliers.routes.js`** / **`clients.routes.js`** : Gestion des tiers.
- **`orders.routes.js`** / **`deliveries.routes.js`** : Gestion du flux de vente et logistique.
- **`invoices.routes.js`** / **`payments.routes.js`** : Gestion financière.
- **`statistics.routes.js`** : Agrégation de données pour le tableau de bord.

---

## 2. Frontend (Interface Utilisateur)

Le frontend offre une expérience utilisateur premium, responsive et interactive.

### Fichiers principaux :
- **`src/App.tsx`** : Le cœur de l'application. Il contient :
  - La configuration du routage (`react-router-dom`).
  - Tous les composants de pages (Dashboard, Liste des produits, Formulaires, etc.).
  - La logique du **Scanner de Code-barres** (utilisant l'API native `BarcodeDetector` avec un fallback).
  - La gestion de l'état global et de l'authentification locale.
- **`src/lib/api.ts`** : Client API structuré utilisant `fetch` pour communiquer avec le backend. Il définit les types TypeScript pour chaque entité.
- **`src/App.css`** : Design system complet. Utilise des variables CSS pour un thème "Marine" (Vert foncé, Menthe, Or) avec des effets de glassmorphism et des animations fluides.

### Pages et Composants :
- **`PublicHome`** : Page d'atterrissage présentant les fonctionnalités.
- **`LoginPage`** : Interface de connexion sécurisée.
- **`DashboardPage`** : Vue d'ensemble avec KPIs (indicateurs clés) et graphiques de flux de stock.
- **`ProductsListPage`** : Tableau interactif avec recherche multicritère et scanner de code-barres.
- **`ProductFormPage`** : Formulaire de création/édition avec intégration du scanner pour assigner un code-barres.
- **`Orders/Deliveries/Invoices`** : Pages dédiées à la gestion opérationnelle.

---

## Fonctionnalités Clés

1. **Traçabilité par Code-barres** : Remplacement des codes QR par des codes-barres standards (Code 128, EAN-13) pour une compatibilité industrielle.
2. **Gestion de Stock Temps Réel** : Mise à jour automatique des quantités lors des livraisons ou des saisies manuelles.
3. **Tableau de Bord Analytique** : Visualisation des tendances de stock et alertes sur les niveaux bas.
4. **Export XML** : Possibilité d'exporter les factures au format XML pour une intégration avec d'autres systèmes.
5. **Sécurité** : Authentification par Token JWT et hachage des mots de passe.

---
*Documentation générée pour MarineStock Pro.*
