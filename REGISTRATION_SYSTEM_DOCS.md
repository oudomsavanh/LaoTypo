# Registration/Login System Documentation

## Overview
This registration system implements a dual-role authentication flow for Hosts and Players with Firebase integration.

## Features

### 1. Tab-Based Interface
- **Host Login Tab**: For users who create and manage sessions
- **Player Login Tab**: For users who join existing sessions

### 2. Authentication Methods

#### Host Login Options:
- **Google Sign-in**: Full authentication with email/password
- **Guest Sign-in**: Anonymous authentication for temporary sessions

#### Player Login:
- **Display Name**: Required field (2-20 characters)
- **Join as Guest**: Checkbox option (default: true)

### 3. First-Time User Flow
When a new user signs in (via Google or Guest), they will:
1. See a role selection modal
2. Choose between "Host" or "Player" role
3. Role is saved to Firestore `users/{uid}` collection
4. Redirected based on selected role

### 4. User Data Structure

#### Firestore Users Collection:
```javascript
users/{uid}: {
  role: "host" | "player",
  createdAt: timestamp,
  email: string (optional),
  displayName: string (optional),
  photoURL: string (optional)
}
```

#### Session Storage (for Players):
```javascript
playerInfo: {
  displayName: string,
  isGuest: boolean,
  joinedAt: ISO string
}
```

### 5. Routing Logic
- **Hosts** → `/host-dashboard.html`
- **Players** → `/join.html`

### 6. Security Features
- Firebase Authentication (Google + Anonymous)
- Firestore security rules enforce user document access
- Input validation on all forms
- ARIA labels for accessibility

## File Structure
```
/registration.html     - Main login/registration page
/host-dashboard.html   - Host dashboard (placeholder)
/join.html            - Player join page (placeholder)
/firebase-config.js   - Firebase configuration
```

## Firebase Configuration

### Required Firebase Services:
1. **Authentication**
   - Google Sign-in provider
   - Anonymous authentication

2. **Firestore Database**
   - `users` collection for role storage
   - Security rules already configured

### Security Rules (Already in place):
```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

## Usage

### For Hosts:
1. Navigate to registration page
2. Stay on "Host Login" tab
3. Sign in with Google or as Guest
4. If first time, select "Host" role
5. Redirected to Host Dashboard

### For Players:
1. Navigate to registration page
2. Click "Player Login" tab
3. Enter display name
4. Choose guest mode preference
5. Click "Join Session"
6. Redirected to Join page

## Accessibility Features
- Keyboard navigation between tabs (Arrow keys)
- ARIA labels and roles
- Focus management
- Screen reader announcements
- High contrast focus indicators

## Error Handling
- Network connectivity checks
- Firebase authentication errors
- Form validation errors
- Toast notifications for user feedback

## Future Enhancements
1. Email/password authentication for Hosts
2. Remember me functionality
3. Social login providers (Facebook, Twitter)
4. Password reset flow
5. Profile management
6. Session persistence options