
# 🛍️ LuxeShop

**LuxeShop** est une application e-commerce complète développée avec Angular pour le frontend, Node.js + Express pour le backend, et MySQL comme base de données.  
Elle permet aux utilisateurs de consulter des produits, gérer leur panier, passer des commandes, et aux administrateurs de gérer les produits, les utilisateurs et les commandes.

---

## 📌 Objectif

Offrir une solution e-commerce moderne, sécurisée et responsive, avec une séparation claire entre le frontend et le backend.

---

## 🧰 Technologies utilisées

### 🔹 Frontend
- Angular (TypeScript)
- Angular Router
- Angular Material (UI components)
- Font Awesome (icônes)
- HTML / SCSS / CSS

### 🔹 Backend
- Node.js
- Express.js
- JWT (authentification)
- dotenv
- MySQL (via `mysql2` ou `Sequelize`)

### 🔹 Base de données
- MySQL

---

## 🧩 UI & Composants

L'interface utilise :

- **Angular Material** pour des composants modernes et responsives  
  Installation via :  
  ```bash
  ng add @angular/material
  ```

- **Font Awesome** pour les icônes (produits, panier, utilisateur, etc.)  
  Ajout via :  
  ```bash
  npm install @fortawesome/fontawesome-free
  ```

  Et dans `angular.json` :
  ```json
  "styles": [
    "node_modules/@fortawesome/fontawesome-free/css/all.min.css"
  ]
  ```

---

## ⚙️ Installation & Lancement

### 1. 📁 Cloner le dépôt

```bash
git clone https://github.com/<ton-nom-utilisateur>/luxeshop.git
cd luxeshop
```

---

### 2. 🚀 Lancer le backend (Node.js + Express)

```bash
cd backend
npm install
```

#### Crée un fichier `.env` :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ton_mot_de_passe
DB_NAME=luxeshop
JWT_SECRET=ta_clé_jwt
```

#### Crée la base de données dans MySQL :

```sql
CREATE DATABASE luxeshop;
```

#### Démarrer le serveur :

```bash
npm start
```

🔗 Serveur backend sur : `http://localhost:3000`

---

### 3. 🌐 Lancer le frontend (Angular)

```bash
cd ../frontend
npm install
ng serve
```

🔗 Application Angular sur : `http://localhost:4200`

---

## ✅ Fonctionnalités

- 🔐 Authentification JWT (inscription / connexion)
- 🛍️ Affichage des produits
- 🛒 Panier dynamique
- 💳 Finalisation des commandes
- ⚙️ Interface d'administration
- 💾 Connexion sécurisée à MySQL

---

## 🔁 Utilisation de Git

Chaque fois que tu avances dans le projet localement, tu dois exécuter manuellement :

```bash
git add .
git commit -m "Description claire des changements"
git push
```

🔁 Les changements **ne sont pas envoyés automatiquement** sur GitHub.

---

## 🌐 Rendre le dépôt public

1. Ouvre ton dépôt sur GitHub  
2. Clique sur **Settings**  
3. Va en bas dans **Danger Zone**  
4. Clique sur **Change repository visibility**  
5. Choisis **Public**

---

## 🚀 Déploiement (à venir)

- Frontend sur [Vercel](https://vercel.com/)
- Backend sur [Render](https://render.com/) ou [Railway](https://railway.app/)
- Paiement avec Stripe
- Envoi d'e-mails avec Nodemailer

---

## 👨‍💻 Auteur

Projet développé par **[Ton Nom / Pseudo]**  
🎓 Projet personnel — Entraînement fullstack (Angular + Node.js)

---

## 📄 Licence

Code open-source sous licence **MIT** — librement modifiable et réutilisable.
