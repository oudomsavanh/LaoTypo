# SPEC-001-LaoTypo Phase 1

## Background

LaoTypo is a web-based, real-time multiplayer word-selection race game adapted to the Lao language. In this word-selection format, players click on the correct word buttons in sequence to progress through a predefined passage. A host (teacher or administrator) creates a session by selecting or uploading a text passage. Players join via a QR code or link, then compete to click each correct word in order as quickly and accurately as possible. The game displays per-player progress, shows a live leaderboard by score, and generates post-game reports.

> **Game Type Name:** Real-time Multiplayer Word-Selection Race Game

## Requirements

### Must have

- **User Roles**: Host/Admin and Player/Student
- **Session Creation**: Host can select from predefined Lao passages
- **Join Mechanics**: Players join sessions by clicking a link or scanning a QR code
- **Real-Time Gameplay**: Word-selection race with low-latency updates (<200 ms), where players click the correct next word button to progress through the passage
- **Scoring System**:
  - **Levels**: Easy, Medium, Hard (30 challenges each)
  - **Points**: Easy = 1 point/correct, Medium = 2 points/correct, Hard = 3 points/correct
  - **Raw Score Calculation**: Sum of (correct answers × level point value)
  - **Max Score Calculation**: Sum of (30 × level point value) for levels played
  - **Percentage Score**: (Raw Score / Max Score for played levels) × 100
- **Evaluation Tiers**:
  - 90%–100%: "You were Lao in a past life, and you are in this one too."
  - 70%–89%: "You are 75% Lao."
  - 40%–69%: "You were born in Laos but grew up abroad."
  - 20%–39%: "At least you're not "insincere.""
  - 0%–19%: "You're a foreigner who missed their flight."
- **Reset Streak Mechanic**:
  - Players have 3 lives per level; lives reset when advancing levels without affecting total score
- **Live Leaderboard**: Ranked by score with tie-breaker on completion time, updating in real time
- **Reporting**: Session summary with scoring breakdown and aggregate metrics
- **Media Support**: Display images or audio clips alongside passages for thematic context
- **Social Sharing**: Share session results via social platforms (e.g., Facebook, Twitter)
- **Hosting on Free/Low-Cost Platforms**: Deploy on AWS Free Tier, GitHub Pages, or Vercel
- **Responsive UI**: Works on desktop and mobile browsers

### Should have

- **Session Analytics Dashboard**: Drill down on passage-segment performance
- **Custom Passages Library**: Hosts can save and reuse passages

### Could have

- **Team Mode**: Group players into teams and aggregate scores
- **Custom Themes**: (Deferred) Change UI colors or backgrounds

### Won't have (MVP scope)

- Native mobile apps (iOS/Android)
- Paid hosting or CDN beyond free tiers
- Persistent user accounts beyond session-based identifiers

---

## Pages & Views

Outlined below is a suggested set of pages (views) for the LaoTypo MVP, along with their primary responsibilities:

1. **Landing Page**

   - Overview of the game, call-to-action buttons (“Host a Game” / “Join a Game”), social share links

2. **Registration / Login Page**

   - Host sign‑in via Firebase Auth (Email/Password or Anonymous), role selection if first time

3. **Host Dashboard**

   - List of existing sessions, option to create a new session, view session reports

4. **Session Creation Page**

   - Select a predefined Lao passage, choose level (Easy/Medium/Hard), configure max lives, generate join code and QR

5. **Join Page**

   - Enter session code or scan QR, input display name, confirmation and redirect to Waiting Room

6. **Waiting Room**

   - Show session details (passage title, level), current player list, “Start Game” button (host only)

7. **Gameplay Page**

   - Word‑selection interface: present buttons for the next words, timer, lives indicator, progress bar

8. **Live Leaderboard Overlay**

   - Real‑time ranking display, updated via Realtime Database; accessible as a slide‑in or modal on all gameplay screens

9. **Post‑Game Report Page**

   - Final scores, percentage, evaluation tier, detailed breakdown by level; social share buttons

10. **Player Profile / History Page** (optional MVP)

- List of past sessions played, personal bests, aggregate statistics

11. **Error / Fallback Page**

- Display user‑friendly messages for session not found, authentication errors, or disconnections

---

## Method

Below is an architecture and approach adapted to use **Firebase** services while still reflecting course-aligned technologies:

```plantuml
@startuml
skinparam componentStyle rectangle

package "Client" {
  [Browser + EJS Templates]
}

package "Server (Node.js + Express)" {
  [Express App]
  [Socket.io]
  [MVC Controllers]
}

package "Data Layer (Firebase)" {
  [Firebase Authentication]
  [Cloud Firestore]
  [Realtime Database]
  [Cloud Storage]
  [Cloud Functions]
}

Browser --> "Express App" : HTTP GET/EJS render
Browser --> "Express App" : HTTP POST/REST
Browser --> "Socket.io" : WebSocket events
Express App --> Cloud Functions : Callable Functions
Cloud Functions --> Firestore : CRUD via Admin SDK
Cloud Functions --> Realtime Database : Publish game events
Browser --> Firebase Realtime Database : Direct real-time updates
Browser --> Firebase Auth : Sign-in/Session
Browser --> Cloud Storage : Fetch media assets

@enduml
```

### Technology Stack Choices with Firebase

- **Front-End Web Development**: HTML5, CSS3 (Flexbox & Grid), Bootstrap 5, JavaScript ES6, DOM manipulation and jQuery, Socket.io client (optional) for additional real-time layering
- **Templating & React Option**: EJS for SSR; can progressively adopt React.js with Hooks and Firebase SDK for an SPA
- **Back-End Web Development**: Node.js with Express.js for serving EJS views, routing, and integrating Socket.io if desired
- **Authentication**: Firebase Authentication with Email/Password or Anonymous sign‑in to manage Host/Admin and Player/Student roles
- **Real-Time & Data Storage**:
  - **Cloud Firestore** for structured data (sessions, passages, results, scoring)
  - **Realtime Database** for low-latency pub/sub of live game events and leaderboard updates
- **Serverless Business Logic**: Firebase Cloud Functions (Node.js) to handle complex scoring, evaluation tiers, and secure data operations
- **Media Assets**: Firebase Cloud Storage for hosting images and audio clips
- **Deployment**: Deploy the Express app to Firebase Hosting with integrated Cloud Functions; use GitHub Actions for CI/CD
- **Version Control & DevOps**: Git, GitHub, GitHub Actions for linting (ESLint) and tests (Mocha & Chai)
- **Data Visualization**: Chart.js in EJS or React views for post-game analytics dashboards
- **Infrastructure Benefits**: No dedicated server for database or caching; Firebase Spark (free) tier covers:
  - **Authentication**: Up to 10k verifications/month
  - **Cloud Firestore**: 1 GiB storage, 50k reads, 20k writes, 20k deletes/day
  - **Realtime Database**: 100 simultaneous connections, 1 GiB storage
  - **Cloud Functions**: 125k invocations/month
  - **Cloud Storage**: 5 GiB storage, 1 GiB downloads/day These quotas are sufficient for MVP and initial user loads.
- **Maximum Simultaneous Clients**: Firebase Realtime Database supports up to 100 concurrent connections on the Spark tier. Cloud Firestore can handle thousands of concurrent clients, limited by read/write throughput quotas (50k reads, 20k writes/day). For higher usage, upgrade to Blaze pay-as-you-go tier.

## Database Schemas

### Firestore Collections

1. **passages** (predefined Lao texts)

   - **Document ID**: `passageId` (auto-generated)
   - **Fields**:
     - `title` (string)
     - `content` (string) – full passage text
     - `level` (string) – "Easy" | "Medium" | "Hard"
     - `createdAt` (timestamp)

2. **sessions** (game sessions)

   - **Document ID**: `sessionId`
   - **Fields**:
     - `hostId` (string) – user UID from Firebase Auth
     - `passageId` (string)
     - `level` (string)
     - `maxLives` (number)
     - `startedAt` (timestamp)
     - `endedAt` (timestamp)
     - `status` (string) – "waiting" | "active" | "completed"

3. **players** (session participants)

   - **Document ID**: `playerId` (auto-generated)
   - **Fields**:
     - `sessionId` (string)
     - `userId` (string) – Firebase Auth UID; anonymous allowed
     - `displayName` (string)
     - `joinedAt` (timestamp)

4. **results** (final scores)

   - **Document ID**: `resultId` (auto-generated)
   - **Fields**:
     - `sessionId` (string)
     - `playerId` (string)
     - `rawScore` (number)
     - `percentageScore` (number)
     - `evaluationTier` (string)
     - `completedAt` (timestamp)

### Realtime Database Structure

Used for low-latency game events and leaderboard updates:

```
RealtimeDB Root
│
├─ /sessions/{sessionId}
│    ├─ status: "active"
│    ├─ nextWordIndex: number
│    ├─ livesReset: true
│    ├─ leaderboard
│    │    ├─ {playerId}
│    │    │    ├─ rawScore: number
│    │    │    ├─ percentage: number
│    │    │    └─ lastClickTs: timestamp
│    └─ players
│         ├─ {playerId}
│         │    ├─ currentIndex: number
│         │    └─ remainingLives: number

└─ /gameEvents/{sessionId}/{eventId}
     ├─ playerId: string
     ├─ wordIndex: number
     └─ timestamp: timestamp
```

- **/sessions/{sessionId}/leaderboard**: Sorted updates via client queries (order by `rawScore` desc, `lastClickTs` asc)
- **/sessions/{sessionId}/players**: Tracks each player’s progress and lives in real time
- **/gameEvents**: Event history for auditing or replay; can be pruned post-session

\*These schemas enable efficient queries in Firestore for reporting and low-latency, fan-out updates in the Realtime Database for live gameplay.

---

## Phase 2: Advanced Schema Recommendations

### Phase 2 Roadmap & Prioritization

1. **Denormalized Leaderboard Snapshots**

   - Create a `leaderboardSnapshots` subcollection under each `sessions/{sessionId}` in Firestore to store periodic sorted leaderboard states.
   - **Snapshot Interval**: every 5 seconds
   - **Retention Period**: retain snapshots for 7 days via Firestore TTL policies
   - **Fields**: `snapshotTime` (timestamp), `rankings` (array of objects `{ playerId, rawScore, percentage }`)
   - **Benefit**: Enables fast historical playback of leaderboard trends and reduces heavy RealtimeDB reads during analytics.

2. **Aggregate Metrics Collection** – next, to enable efficient dashboard rendering and reporting.

3. **Player Progress Checkpoints**

   - Store interim progress in Firestore under `sessions/{sessionId}/players/{playerId}/checkpoints` at key indices (e.g., every 10 words).
   - **Fields**: `wordIndex`, `timestamp`, `remainingLives`, `rawScore`
   - **Reconnect Logic**: On WebSocket or Realtime Database reconnection, fetch the latest checkpoint document for the player and resume by setting `nextWordIndex` to the checkpoint’s `wordIndex`, restoring lives and rawScore from the checkpoint.
   - **Benefit**: Facilitates resume logic for reconnecting players, minimizing lost progress from intermittent connections.

4. **Aggregate Metrics Collection**\*\*

   - Maintain an `analytics.sessionMetrics` collection that stores computed aggregates post-session such as average rawScore, average percentageScore, peak concurrency, and session duration.
   - **Fields**: `sessionId`, `avgRawScore`, `avgPercentage`, `maxPlayers`, `duration`, `createdAt`
   - **Benefit**: Simplifies dashboard rendering and avoids on-the-fly heavy aggregation queries.

5. **Security Rules with Role-Based Access**

   - Define Firebase Security Rules that restrict writes under `sessions/{sessionId}` to authenticated hosts (via custom claims) and writes under `players/{playerId}` only by that player.
   - **Example**:
     ```
     match /sessions/{sessionId} {
       allow write: if request.auth.token.role == 'host' && request.auth.uid == resource.data.hostId;
       allow read: if true;
     }
     match /sessions/{sessionId}/players/{playerId} {
       allow update: if request.auth.uid == playerId;
     }
     ```
   - **Custom Claims Assignment**: Use Firebase Admin SDK in a Cloud Function triggered on user creation (or an admin interface) to assign a `role` custom claim (`'host'` or `'player'`). match /sessions/{sessionId}/players/{playerId} { allow update: if request.auth.uid == playerId; }
     ```
     ```

6. **Time-To-Live (TTL) Indexes for Cleanup**

   - **Expiration Period**: Automatically delete stale session and event data older than 7 days.
   - **Firestore Configuration**: Enable Firestore TTL on the `createdAt` (or custom `expireAt`) field by creating a TTL policy in Firebase console or via `gcloud firestore indexes create` CLI. Documents in collections like `gameEvents` and `leaderboardSnapshots` will expire 7 days after their timestamp.
   - **Realtime Database Configuration**: Use Firebase Realtime Database’s `ttl` rules by including a `ttl` field (timestamp) in each node and configure a Realtime Database rule to periodically remove entries older than 7 days via Cloud Functions or scheduled Functions using `firebase-admin` SDK.
   - **Benefit**: Automates data retention policies, controls storage costs, and keeps the database performant without manual cleanup.

---

## Implementation

- **Phase 1**: Develop MVP with core features, Firebase integration, and basic schemas.
- **Phase 2**: Roll out Advanced Schema Recommendations as per the Phase 2 Roadmap & Prioritization.

## Milestones

### Timeline & Key Dates

- **Now – July 31, 2025**: Finalize MVP feature set, complete authentication flow, and basic real‑time gameplay implementation.
- **August 1–2, 2025 (Coaching Day 1)**: Present initial MVP to coaches; gather feedback on UX and core mechanics.
- **August 3–10, 2025**: Iterate on MVP based on coaching feedback; stabilize scoring, leaderboard, and reporting features.
- **Mid-August (Coaching Day 2)**: Demonstrate refined MVP; validate performance under simulated load (up to 50 concurrent users).
- **August 15–31, 2025**: Bug fixes, UI polish, documentation, and end-to-end testing across browsers and devices.
- **September 1–10, 2025**: Final rehearsal sessions; prepare demo script and slide deck; record walkthrough videos.
- **September 11–16, 2025**: Dry-run demo with key stakeholders; finalize deployment and performance checks.
- **September 17, 2025 (Demo Day)**: Showcase LaoTypo MVP; collect audience feedback and plan Phase 2 roadmap.

1. **MVP Launch (Phase 1)**

   - Complete core game UI and flow
   - Set up Firebase Authentication, Realtime Database, and Firestore schemas
   - Implement scoring, leaderboard, and reporting
   - Deploy to Firebase Hosting

2. **Advanced Features (Phase 2)**

   - Denormalized leaderboard snapshots and sharded event collections
   - Aggregate metrics collection and progress checkpoints
   - Security rules with custom claims and TTL indexes
   - Regional data localization and performance optimization

## Gathering Results

- **Phase 1 Metrics**:

  - User engagement: average session length, peak concurrency
  - System performance: latency, error rates
  - Feature validation: user feedback on core gameplay

- **Phase 2 Metrics**:

  - Analytics accuracy: dashboard refresh rates, data completeness
  - Scalability: support for concurrent connections beyond MVP limits
  - Security compliance: enforcement of role-based access controls


