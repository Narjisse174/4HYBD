# Snapshoot - Application de Partage de Photos

Une application mobile de partage de photos et de messagerie en temps réel, développée avec React Native et Node.js.

## Fonctionnalités

- 🔐 Authentification des utilisateurs
- 📸 Partage de photos
- 💬 Messagerie en temps réel
- 👥 Découverte d'utilisateurs à proximité
- 👤 Profils personnalisables

## Technologies Utilisées

### Frontend
- React Native
- Expo
- TypeScript
- Socket.io-client
- AsyncStorage

### Backend
- Node.js
- Express
- MongoDB
- Socket.io
- JWT Authentication

## Installation

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB
- Expo CLI
- Android Studio (pour l'émulateur Android)

### Backend
```bash
cd backend
npm install
# Créer un fichier .env avec les variables suivantes :
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/snapshoot
# JWT_SECRET=votre_secret_jwt
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npx expo start
```

## Configuration

### Variables d'Environnement Backend
Créez un fichier `.env` dans le dossier `backend` avec les variables suivantes :
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/snapshoot
JWT_SECRET=votre_secret_jwt
```

## Utilisation

1. Lancez le backend et le frontend
2. Créez un compte ou connectez-vous
3. Explorez les fonctionnalités de l'application

## Structure du Projet

```
snapshoot/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── screens/
    │   ├── services/
    │   ├── components/
    │   └── App.tsx
    └── package.json
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

MIT 