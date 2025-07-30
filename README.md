# LaoTypo - Real-time Multiplayer Word-Selection Race Game

<div align="center">
  <img src="LaoTypo-logo-04.png" alt="LaoTypo Logo" width="200">
  
  A web-based, real-time multiplayer word-selection race game adapted for the Lao language
  
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

## 🎮 Overview

LaoTypo is an educational word-selection race game where players compete in real-time by clicking the correct Lao words in sequence to progress through predefined passages. Teachers or administrators can host sessions, and students join via QR codes or links to compete for the highest score and fastest completion time.

## ✨ Key Features

### Core Gameplay
- **Real-time Multiplayer**: Low-latency updates (<200ms) for seamless competition
- **Word-Selection Mechanics**: Click correct words in sequence 
- **Three Difficulty Levels**: 
  - Easy (1 point per correct answer)
  - Medium (2 points per correct answer)  
  - Hard (3 points per correct answer)
- **Lives System**: 3 lives per level, reset when advancing levels
- **Live Leaderboard**: Real-time ranking by score with time-based tiebreakers

### Scoring & Evaluation
- **Percentage-based Scoring**: (Raw Score / Max Possible Score) × 100
- **Humorous Evaluation Tiers**:
  - 90%–100%: "You were Lao in a past life, and you are in this one too."
  - 70%–89%: "You are 75% Lao."
  - 40%–69%: "You were born in Laos but grew up abroad."
  - 20%–39%: "At least you're not 'insincere.'"
  - 0%–19%: "You're a foreigner who missed their flight."

### User Experience
- **Two User Roles**: Host/Admin and Player/Student
- **Easy Session Join**: QR code or link-based entry
- **Progressive Web App**: Install on mobile devices for an app-like experience
- **Responsive Design**: Works seamlessly on desktop and mobile browsers
- **Social Sharing**: Share results on social platforms

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **HTML5, CSS3** with Tailwind CSS for responsive design
- **JavaScript ES6** for game logic
- **Tone.js** for sound effects
- **Progressive Web App** with service worker for offline capabilities

#### Backend & Services
- **Firebase Authentication**: User management and role-based access
- **Cloud Firestore**: Structured data storage (sessions, passages, results)
- **Firebase Realtime Database**: Low-latency live game events and leaderboard
- **Firebase Cloud Functions**: Serverless business logic
- **Firebase Cloud Storage**: Media assets (images, audio)
- **Firebase Hosting**: Web app deployment

### Database Schema

#### Firestore Collections
```
passages/
├── passageId
│   ├── title (string)
│   ├── content (string)
│   ├── level (string: "Easy"|"Medium"|"Hard")
│   └── createdAt (timestamp)

sessions/
├── sessionId
│   ├── hostId (string)
│   ├── passageId (string)
│   ├── level (string)
│   ├── maxLives (number)
│   ├── status (string: "waiting"|"active"|"completed")
│   └── timestamps

players/
├── playerId
│   ├── sessionId (string)
│   ├── userId (string)
│   ├── displayName (string)
│   └── joinedAt (timestamp)

results/
├── resultId
│   ├── sessionId (string)
│   ├── playerId (string)
│   ├── rawScore (number)
│   ├── percentageScore (number)
│   ├── evaluationTier (string)
│   └── completedAt (timestamp)
```

#### Realtime Database Structure
```
/sessions/{sessionId}/
├── status: "active"
├── leaderboard/
│   └── {playerId}/
│       ├── rawScore
│       ├── percentage
│       └── lastClickTs
└── players/
    └── {playerId}/
        ├── currentIndex
        └── remainingLives
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Firebase account (free tier is sufficient)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/laotypo.git
   cd laotypo
   ```

2. **Set up Firebase**
   - Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication, Firestore, Realtime Database, and Storage
   - Copy your Firebase configuration

3. **Configure the app**
   - Update `firebase-config.js` with your Firebase credentials
   - Ensure all Firebase services are properly initialized

4. **Deploy to Firebase Hosting**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   firebase deploy
   ```

### Local Development
Open the HTML files directly in your browser for development:
- `registration.html` - User registration/login
- `gameplay.html` - Main game interface
- `testing.html` - Testing interface for development

## 📱 Game Flow

1. **Host Creates Session**
   - Sign in as host
   - Select a Lao passage
   - Choose difficulty level
   - Generate join code/QR

2. **Players Join**
   - Scan QR code or enter session code
   - Enter display name
   - Wait in the lobby for the host to start

3. **Gameplay**
   - Click correct words in sequence
   - Track lives and score
   - View real-time leaderboard

4. **Results**
   - See final scores and rankings
   - Get evaluation tier
   - Share results on social media

## 🛠️ Development Roadmap

### Phase 1 (MVP) ✅
- Core gameplay mechanics
- Firebase integration
- Basic scoring and leaderboard
- Mobile-responsive design
- PWA capabilities

### Phase 2 (Planned)

- TBC 🫡🫡🫡

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Designed for educational use in teaching the Lao language
- Built with Firebase's generous free tier

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Check the [detailed specification](README_Phase1.md)
- Review Firebase documentation for service-specific questions

---

**Made with ❤️ for Lao language learners and educators worldwide!** 
