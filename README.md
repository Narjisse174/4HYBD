# Snapshoot - Social Media Application

## Project Overview
Snapshoot is a social media platform targeting young people between 16 and 35 years old. The application focuses on real-time photo and video sharing, similar to Snapchat and BeReal, with a maximum video duration of 10 seconds.

## Features

### User Management 
- User registration and authentication
- Profile management with email and ID
- User search functionality
- Profile picture upload

### Friend System 
- Find and add friends
- Friend request management
- Friend list view
- User search by username or email

### Messaging System
- **One-to-One Messages**
  - Real-time messaging
  - Photo sharing
  - Video sharing (10s max)
  - Message status (sent, delivered, read)

- **Group Messages**
  - Create group conversations
  - Send messages to multiple users
  - Share photos and videos in groups
  - Group management

### Location Features
- GPS-based story discovery
- Find users by location
- View stories from nearby users
- Location-based content sharing

## Technical Stack

### Backend
- Node.js with Express
- MongoDB for database
- Socket.IO for real-time communication
- JWT for authentication
- RESTful API architecture

### Frontend
- React Native
- Expo framework
- TypeScript
- React Navigation
- Context API for state management

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, optional)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/snapshoot
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=*
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```
   API_URL=http://localhost:3000/api
   ```
4. Start the Expo development server:
   ```bash
   npx expo start
   ```

## Running the Application

### Android
1. Install Expo Go from the Play Store
2. Scan the QR code from the terminal
3. The app will load on your device

### iOS (Optional)
1. Install Expo Go from the App Store
2. Scan the QR code from the terminal
3. The app will load on your device

## Project Structure

### Backend
```
backend/
├── src/
│   ├── controllers/    # Business logic
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── index.js       # Entry point
```

### Frontend
```
frontend/
├── src/
│   ├── screens/       # App screens
│   ├── components/    # Reusable components
│   ├── services/      # API services
│   ├── navigation/    # Navigation config
│   └── contexts/      # State management
```

## API Documentation

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update profile
- GET `/api/users/search` - Search users
- GET `/api/users/nearby` - Find nearby users

### Friends
- GET `/api/friends` - Get friends list
- POST `/api/friends/request/:userId` - Send friend request
- GET `/api/friends/requests` - Get friend requests
- PUT `/api/friends/request/:requestId` - Handle friend request

### Messages
- POST `/api/messages` - Send message
- GET `/api/messages/conversations` - Get conversations
- GET `/api/messages/:conversationId` - Get conversation messages
- PUT `/api/messages/:messageId/read` - Mark message as read

