# LaoTypo - Real-time Multiplayer Word-Selection Race Game

<div align="center">
  <img src="images/LaoTypo-logo-04.png" alt="LaoTypo Logo" width="200">
  
  A web-based, real-time multiplayer word-selection race game adapted for the Lao language
  
  <!-- Remove technology badges that reveal stack details -->
</div>

## 🎮 Overview

LaoTypo is an educational word-selection race game where players compete in real-time by clicking the correct Lao words in sequence to progress through predefined passages. Teachers or administrators can host sessions, and students join to compete for the highest score and fastest completion time.

## ✨ Key Features

### Core Gameplay
- **Real-time Multiplayer**: Low-latency competition
- **Word-Selection Mechanics**: Click correct words in sequence 
- **Three Difficulty Levels**: Easy, Medium, and Hard with progressive scoring
- **Smart Word Filtering**: Words filtered by difficulty (Column D values from Google Sheets)
- **Lives System**: Limited attempts per level with recovery bonus
- **Live Leaderboard**: Real-time ranking system
- **Replay Randomization**: Fresh word order on every replay

### Scoring & Evaluation
- **Percentage-based Scoring**: Performance-based evaluation
- **Humorous Evaluation Tiers**: Fun feedback based on score ranges
- **Progress Tracking**: Total words completed counter
- **Cumulative Progress Display**: Shows 15/30/45 progress across levels
- **Life Recovery System**: +1 life bonus after completing sessions

### User Experience
- **Two User Roles**: Host/Admin and Player/Student
- **Easy Session Join**: Simple entry system
- **Progressive Web App**: Mobile-friendly experience
- **Responsive Design**: Works on various devices
- **Social Sharing**: Share results feature
- **Enhanced Answer Validation**: Fixed word pair matching for accurate scoring

## 🏗️ Architecture

<!-- Remove detailed technology stack information -->
This application uses modern web technologies with a focus on real-time performance and scalability.

<!-- Remove database schema details -->

## 🚀 Getting Started

### Prerequisites
- Modern web browser
- Required development tools (contact administrator for details)

### Installation

<!-- Remove specific repository and configuration details -->
1. **Setup Instructions**
   - Contact the project administrator for access
   - Follow the provided secure setup guide
   - Configuration details will be provided separately

### Development

<!-- Remove specific file names -->
- Development environment setup instructions available upon request
- Testing procedures documented separately

## 📱 Game Flow

1. **Host Creates Session**
   - Authenticated host access
   - Content selection
   - Session configuration

2. **Players Join**
   - Secure session entry
   - Identity verification
   - Lobby system

3. **Gameplay**
   - Interactive word selection
   - Progress tracking
   - Real-time updates

4. **Results**
   - Performance metrics
   - Ranking display
   - Result sharing

## 🎮 Detailed Game Logic & Requirements

### Game Structure
- **Session Length**: Each session = 15 words
- **Total Levels**: 3 levels (Easy → Medium → Hard)
- **Total Words**: 45 words maximum (15 per level)
- **Lives System**: 3 hearts per session

### Word Selection Logic
- **Data Source**: Google Sheets CSV with columns:
  - **Column A**: Context/Passage (displayed to player)
  - **Column B**: Correct answer
  - **Column C**: Incorrect answer
  - **Column D**: Difficulty level (1=Easy, 2=Medium, 3=Hard)
- **Filtering**: Words filtered by Column D values based on current level
- **Randomization**: Words shuffled within each difficulty level
- **Re-shuffling**: Fresh random order on every replay

### Level Progression System
- **Level 0 (Easy)**: 
  - Words: Column D = 1
  - Progress Display: "ຕອບຖືກ: X / 15"
  - Threshold: 15 words to complete
- **Level 1 (Medium)**:
  - Words: Column D = 2
  - Progress Display: "ຕອບຖືກ: X / 30"
  - Threshold: 15 words to complete (30 total)
- **Level 2 (Hard)**:
  - Words: Column D = 3
  - Progress Display: "ຕອບຖືກ: X / 45"
  - Threshold: 15 words to complete (45 total)

### Scoring & Lives System
- **Correct Answer**: +1 to current streak, +1 to level progress
- **Incorrect Answer**: -1 life, streak resets to 0
- **Life Recovery**: +1 life bonus when completing a session (capped at 3)
- **Game Over**: When lives reach 0
- **Level Complete**: When 15 words completed in current level

### Replay & Reset Logic
- **Replay Current Level**:
  - Score resets to 0
  - Lives reset to 3
  - Level progress resets to 0
  - Words re-shuffled for fresh order
  - Total progress tracking continues
- **Complete Game Reset**:
  - All scores reset to 0
  - Lives reset to 3
  - All progress reset to 0
  - All words re-shuffled
  - Returns to Level 0 (Easy)

### Progress Tracking
- **Current Streak**: Consecutive correct answers in current session
- **Best Streak**: Highest streak achieved (persistent)
- **Level Progress**: Words completed in current level (0-15)
- **Total Words Completed**: Cumulative words across all sessions
- **Level Completion**: Tracks which levels have been completed

### Answer Validation Logic
- **Word Pair Storage**: Current word pair stored globally for accurate checking
- **Answer Checking**: Compares selected word with Column B (correct answer)
- **Visual Feedback**: Green for correct, red for incorrect
- **Sound Feedback**: Different sounds for correct/incorrect answers

### UI Elements & Display
- **Progress Counter**: Shows current/total words for level
- **Total Progress**: Displays cumulative words completed
- **Lives Display**: Heart icons showing remaining lives
- **Difficulty Display**: Shows current level name and color
- **Score Display**: Current streak and best streak
- **Level Transition Modal**: Appears when level completed

### Game States
- **Waiting**: Players joining, not started
- **Active**: Game in progress
- **Paused**: Level transition modal shown
- **Completed**: All levels finished, results shown
- **Game Over**: Lives exhausted, restart required

### Data Persistence
- **Local Storage**: Best streak, game settings, user preferences
- **Session Storage**: Current game state, progress tracking
- **Firebase**: User accounts, session data, leaderboards

### Error Handling
- **Word Loading**: Fallback to default words if Google Sheets unavailable
- **Network Issues**: Graceful degradation with retry options
- **Invalid Data**: Skip malformed entries, continue with valid data
- **Browser Compatibility**: Progressive enhancement for older browsers

## 🔧 Technical Requirements

### System Requirements
- **Browser**: Modern web browser with JavaScript enabled
- **Internet**: Required for Google Sheets data loading and Firebase services
- **Screen Resolution**: Responsive design supports mobile to desktop
- **Audio**: Optional sound effects (graceful degradation if disabled)

### Data Requirements
- **Google Sheets**: CSV format with specific column structure
- **Column A**: Context/Passage (text displayed to player)
- **Column B**: Correct answer (text for validation)
- **Column C**: Incorrect answer (text for wrong option)
- **Column D**: Difficulty level (numeric: 1, 2, or 3)
- **Minimum Words**: At least 15 words per difficulty level recommended

### Performance Requirements
- **Load Time**: Initial load < 3 seconds
- **Response Time**: Word selection response < 100ms
- **Memory Usage**: Optimized for mobile devices
- **Network**: Efficient data loading with caching

### Security Requirements
- **Authentication**: Firebase Auth for user management
- **Data Validation**: Input sanitization and validation
- **CSRF Protection**: Secure form submissions
- **Content Security**: XSS prevention measures

### Browser Compatibility
- **Chrome**: Version 80+
- **Firefox**: Version 75+
- **Safari**: Version 13+
- **Edge**: Version 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+

### Accessibility Requirements
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG 2.1 AA compliance
- **Text Size**: Scalable text for readability

## 🛠️ Development Status

### Current Phase (v2.3.1)
- Core functionality implemented
- Security measures in place
- Performance optimized
- **Latest Updates**:
  - Smart word filtering by difficulty levels
  - Replay randomization system
  - Life recovery bonus system
  - Progress tracking with cumulative display
  - Fixed answer validation logic
  - Enhanced UI with total words completed counter

### Version History
- **v2.3.1** (Current): Game logic improvements, UI fixes, answer validation fixes
- **v2.3.0**: Smart word filtering, replay randomization, life recovery system
- **v2.2.0**: Sound system implementation
- **v2.1.0**: Authentication and scoring system
- **v2.0.0**: Progressive difficulty system with lives

### Future Development
- Additional features planned
- Continuous improvements
- Security enhancements

### 🚀 Planned Migration to Firebase Hosting
- **Timeline**: Q1 2025
- **Benefits**: Enhanced security, better integration with Firebase services, custom domain support
- **New URL**: Will be available at `https://laotypo-a8e80.web.app`
- **Current URL**: Will continue to work during transition period

<!-- Remove specific license information for closed source -->
## 📄 Project Status

This is a closed-source project. All rights reserved.

## 🙏 Acknowledgments

- Designed for educational use in teaching the Lao language
- Built with performance and security in mind

## 📞 Support

For authorized users:
- Contact project administrator for support
- Refer to internal documentation
- Follow established support channels

---

**Secure educational platform for Lao language learning** 
