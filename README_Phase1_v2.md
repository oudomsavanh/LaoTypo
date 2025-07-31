# SPEC-003-LaoTypoMultiplayer

## Background

LaoTypo is a fully serverless, real-time multiplayer word-selection race game for Lao language learners. Hosts launch timed sessions using predefined Lao passages; players join with a code or QR, clicking the correct word buttons in sequence. The system calculates scores (Easy=1, Medium=2, Hard=3 points), converts to percentage, and assigns a Lao-themed evaluation tier. All services run on Firebase (Spark tier), with CI/CD via GitHub Actions. A custom domain can be added post-MVP.

## Requirements

### Must Have (MVP)

- **User Roles**: Host/Admin and Player/Guest (anonymous, no persistent account)
- **Authentication**:
  - **Host**: Firebase Email/Password auth, restricted to `@gmail.com` domains, or anonymous sign-in
  - **Player**: Anonymous Firebase auth with display name
- **Session Lifecycle**:
  - **Create**: Host selects passage, level, max lives (default 3); system generates 6-character code & QR
  - **Waiting**: Lobby shows current players, session details
  - **Start**: Host triggers session start; state switches to "active"
  - **Complete**: After final word, state switches to "completed" and results stored
- **Gameplay**:
  - Real-time word-button clicks delivered via Firebase Realtime Database (<100ms latency)
  - Lives: decrement on incorrect click; reset per-level on progress
  - Progress tracking: `nextWordIndex`, `currentIndex`, `remainingLives` per player
- **Scoring & Evaluation**:
  - Raw score summed per correct click (by level weight)
  - Percentage = (Raw / MaxPossible) × 100
  - Tiers: 90–100% ("Lao in a past life"), 70–89% ("75% Lao"), 40–69%, 20–39%, 0–19%
- **Leaderboard**: Live sorted by rawScore desc, then lastClickTs asc
- **Reporting**: Post-game page with table of results, Chart.js timeline, CSV download
- **Media Support**: Serve images/audio via Firebase Storage
- **Social Sharing**: Copy link, Facebook/Twitter share buttons
- **Hosting & CDN**: Firebase Hosting, custom domain later
- **Deployment Pipeline**: GitHub Actions running on push to `main`, building UI and deploying functions

### Should Have

- In-depth analytics dashboard (segment accuracy, average speed)
- Suggest-passage feature for hosts (queued for admin approval)

### Won’t Have (MVP)

- Native mobile apps
- Complex user profiles or long-term persistence beyond sessions
- Paid hosting or external CDN (all free-tier services)

---

## Pages & Views (Detailed)

### 1. Landing Page (`/`)

- **Header**: `<nav>` with logo (links `/`), nav links (How It Works, Demo, Contact)
- **Hero**: `<section>` with `<h1>`, `<p>`, two CTA buttons:
  - `Host a Game` → `/auth?role=host`
  - `Join a Game` → scroll to join form
- **How It Works**: 3 columns with icon SVGs and steps
- **Features**: 4 responsive cards with icon, title, text
- **Demo GIF/Video**: `<video>` with `autoplay muted loop` + `poster`
- **Testimonials**: Carousel or grid of quotes
- **Footer**: Privacy, Terms, Contact, social icons
- **Mobile**: Stack sections vertically, ensure tap targets ≥44×44px

### 2. Registration / Login Page (`/auth`)

#### Layout

- **Tabs**: `<ul role="tablist">` with two `<button role="tab">`: Host, Player
- **Host Tab**:
  - **Email** `<input type="email" required>` with pattern `.+@gmail\.com$`
  - **Password** `<input type="password" minlength="6" required>`
  - **Remember Me** `<input type="checkbox">`
  - **Sign In** `<button>` triggers `signInWithEmailAndPassword` or client-side domain validation
  - **OR** divider
  - **Anonymous** `<button>` triggers `signInAnonymously()`
  - **First-Time?** link opens modal
- **Player Tab**:
  - **Display Name** `<input type="text" maxlength="20" placeholder="Your name">`
  - **Join as Guest** `<input type="checkbox" checked>`
  - **Join Session** `<button>` redirects to `/join`
- **Role-Selection Modal**:
  - **Radio** `Host` / `Player`, Save & Continue writes to Firestore `users/{uid}` `{ role, createdAt }`
  - **Accessible**: `aria-labelledby`, focus trap

### 3. Host Dashboard (`/host/dashboard`)

- **Navbar**: Host name, Logout, Create Session
- **Sessions Table**:
  - Columns: Code, Title, Level, Lives, PlayersCount, Status, Actions
  - Row actions: `Start`, `Report`, `Delete`
- **Create Session**: button opens modal identical to Session Creation page
- **Real-Time**: subscribe to Firestore `sessions_meta` and Realtime Database for status flags

### 4. Session Creation Page (`/host/create`)

- **Form**:
  - **Passage** dropdown (`<select>`) listing Firestore `passages` docs
  - **Level** radio group
  - **Max Lives** `<input type="number" min=1 max=10 value=3>`
  - **Create** button disabled until all fields valid
- **On Submit**: call Cloud Function `createSession({ passageId, level, maxLives })` returning `{ sessionId, code }`
- **Result Panel**:
  - Display session code in `<h2>`, QR via `qrcode` library, share icons
  - Link to `/host/session/{id}/waiting`

### 5. Join Page (`/join`)

- **Form**:
  - **Session Code** `<input pattern="[A-Z0-9]{6}" required>`
  - **Display Name** prefilled from auth
  - **Join** triggers Callable Function `joinSession({ code, displayName })`
- **Error Handling**: catch `SessionNotFound`, `SessionFull`, display inline error

### 6. Waiting Room (`/session/{id}/waiting`)

- **Info Panel**: passage title, level, max lives, code, copy-to-clipboard
- **Participants List**: live list via Realtime DB `/sessions/{id}/players`
- **Start Game** button (enabled if currentUser.role==host && players>=1)
- **Countdown**: show 3–2–1 before navigating to `/session/{id}/play`

### 7. Gameplay Page (`/session/{id}/play`)

- **Word Grid**: responsive grid of `<button data-index>` with current clickable word highlighted
- **Progress**: `<progress value>` or custom bar reflecting `nextWordIndex/totalWords`
- **Lives**: icon list or numeric badge
- **Timer**: optional elapsed time
- **Event Handling**: on click, call `database.ref('/sessions/id/gameEvents').push({ playerId, wordIndex, ts })`
- **Error Feedback**: CSS `.error` flash on wrong button

### 8. Live Leaderboard Overlay

- **Trigger**: swipe or `L` key opens overlay
- **List**: `<ul>` sorted by `/sessions/id/leaderboard` listener updates

### 9. Post-Game Report (`/session/{id}/report`)

- **Header**: Final title + share
- **Table**: rank, name, raw, %Score, tier
- **Chart**: Chart.js line for progression or bar for errors
- **CSV Export**: generate via Blob and `URL.createObjectURL`

### 10. Error/Fallback

- Universal React Router catch-all or Firebase Hosting `404.html`
- Show friendly message + nav buttons

---

## Method & Architecture

### PlantUML Diagram

```plantuml
@startuml
skinparam componentStyle rectangle

package Client {
  [React App]
}
package Firebase {
  [Auth]
  [RealtimeDB]
  [Firestore]
  [Cloud Functions]
  [Storage]
  [Hosting]
}

React App --> Auth : signIn()
React App --> RealtimeDB : read/write live state
CF --> Firestore : manage passages, sessions_meta, results
React App --> Firestore : fetch meta & reports
React App --> Storage : load media
React App --> Hosting : served static

@enduml
```

### Firebase Data Models

**Realtime Database**:

```json
{
  "sessions": {
    "{sessionId}": {
      "status": "waiting",
      "nextWordIndex": 0,
      "players": {
        "{playerId}": { "currentIndex":0, "remainingLives":3 }
      },
      "leaderboard": {
        "{playerId}": { "rawScore":0, "lastClickTs":0 }
      }
    }
  }
}
```

**Firestore Collections**:

- **passages**: `{ id, title, content, level, createdAt }`
- **sessions\_meta**: `{ sessionId, code, hostId, passageId, level, maxLives, createdAt }`
- **results**: `{ sessionId, playerId, rawScore, percentage, tier, completedAt }`
- **leaderboardSnapshots** (subcol of sessions\_meta/{id}): `{ snapshotTime, rankings: [ {playerId, rawScore, percentage} ] }`
- **analytics.sessionMetrics**: `{ sessionId, avgRaw, avgPerc, maxPlayers, duration, createdAt }`

### Cloud Functions

- **createSession**: HTTP callable; writes to `sessions_meta`; initializes RealtimeDB nodes
- **joinSession**: callable; validates code, writes to RealtimeDB `/players` node
- **computeScore**: triggered on RealtimeDB write to `/gameEvents`; updates `/leaderboard`
- **finalizeResults**: on DB status `completed`; writes to Firestore `results` and snapshots
- **cleanupTTL**: scheduled daily; deletes old snapshots and sessions >7d
- **assignCustomClaims**: onAuth user create; sets `role` claim based on host tab or guest

---

## Implementation & CI/CD

1. **GitHub Repo**:
   - `/src` client code, `/functions` Cloud Functions
   - `.github/workflows/deploy.yml`: on `push/main`, run `npm install && npm run build && firebase deploy`
2. **Firebase Setup**:
   - Enable Auth providers (Email, Anonymous)
   - Create RealtimeDB and Firestore, deploy security rules
   - Configure Hosting and link repo via Firebase CLI
3. **Env & Secrets**:
   - Store `FIREBASE_TOKEN`, `DB_URL`, `STORAGE_BUCKET` in GitHub Secrets
4. **Testing**:
   - Unit tests in `/functions` using Mocha/Chai
   - E2E tests for UI flows using Cypress (optional)

---

## Milestones & Timeline

- **Jul 31–Aug 2**: Initialize project, configure Firebase, scaffold CI/CD
- **Aug 3–10**: Implement Auth, Landing, Auth pages
- **Aug 11–18**: Build Session flows (create, join, waiting)
- **Aug 19–25**: Real-time gameplay & leaderboard
- **Aug 26–31**: Final report page, media support, social sharing
- **Sep 1–12**: Coach demos, feedback iterations
- **Sep 13–16**: Final polish, add custom domain
- **Sep 17**: Demo Day

---

## Need Professional Help?

Contact at [sammuti.com](https://sammuti.com) :)

