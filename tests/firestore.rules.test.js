const fs = require('fs');
const path = require('path');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} = require('@firebase/rules-unit-testing');

const PROJECT_ID = 'laotypo-test';
const RULES_PATH = path.join(__dirname, '..', 'firestore.rules');

describe('Firestore security rules', () => {
  let testEnv;

  const buildAuthToken = (overrides = {}) => {
    const base = { firebase: { sign_in_provider: 'password' } };
    const token = { ...base, ...overrides };
    token.firebase = { ...base.firebase, ...(overrides.firebase || {}) };
    return token;
  };

  const getContext = (uid, overrides = {}) => testEnv.authenticatedContext(uid, buildAuthToken(overrides));

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: fs.readFileSync(RULES_PATH, 'utf8')
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('players collection', () => {
    it('allows a player to read and write their own document', async () => {
      const ctx = getContext('playerA');
      const db = ctx.firestore();
      await assertSucceeds(db.collection('players').doc('playerA').set({ displayName: 'Alice' }));
      await assertSucceeds(db.collection('players').doc('playerA').get());
    });

    it('blocks access to other player documents', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('players').doc('playerA').set({ displayName: 'Alice' });
      });

      const ctx = getContext('playerB');
      const db = ctx.firestore();
      await assertFails(db.collection('players').doc('playerA').get());
      await assertFails(db.collection('players').doc('playerA').set({ displayName: 'Bob' }));
    });
  });

  describe('users collection', () => {
    it('allows a user to manage their own profile', async () => {
      const ctx = getContext('userA');
      const db = ctx.firestore();
      await assertSucceeds(db.collection('users').doc('userA').set({ role: 'host' }));
      await assertSucceeds(db.collection('users').doc('userA').update({ role: 'player' }));
    });

    it('blocks users from touching other profiles', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('userA').set({ role: 'host' });
      });

      const ctx = getContext('userB');
      const db = ctx.firestore();
      await assertFails(db.collection('users').doc('userA').get());
    });
  });

  describe('sessions collection', () => {
    it('allows hosts to create sessions', async () => {
      const host = getContext('host1');
      const db = host.firestore();
      await assertSucceeds(db.collection('sessions').doc('ABC123').set({
        code: 'ABC123',
        name: 'Morning Session',
        type: 'class',
        maxPlayers: 10,
        hostId: 'host1',
        status: 'waiting',
        players: [],
        playerIds: [],
        updatedAt: new Date().toISOString()
      }));
    });

    it('allows participants to update their readiness but not others', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('players').doc('player1').set({ displayName: 'Alice' });
        await adminDb.collection('players').doc('player2').set({ displayName: 'Bob' });
        await adminDb.collection('sessions').doc('ABC123').set({
          code: 'ABC123',
          name: 'Morning Session',
          type: 'class',
          maxPlayers: 10,
          hostId: 'host1',
          status: 'waiting',
          players: [
            { uid: 'player1', displayName: 'Alice', isReady: false },
            { uid: 'player2', displayName: 'Bob', isReady: false }
          ],
          playerIds: ['player1', 'player2'],
          updatedAt: new Date().toISOString()
        });
      });

      const participant = getContext('player1');
      const participantDb = participant.firestore();
      await assertSucceeds(participantDb.collection('sessions').doc('ABC123').update({
        players: [
          { uid: 'player1', displayName: 'Alice', isReady: true },
          { uid: 'player2', displayName: 'Bob', isReady: false }
        ],
        playerIds: ['player1', 'player2'],
        updatedAt: new Date().toISOString()
      }));

      const intruder = getContext('player3');
      const intruderDb = intruder.firestore();
      await assertFails(intruderDb.collection('sessions').doc('ABC123').update({
        players: [
          { uid: 'player1', displayName: 'Alice', isReady: true },
          { uid: 'player2', displayName: 'Bob', isReady: true }
        ],
        playerIds: ['player1', 'player2'],
        updatedAt: new Date().toISOString()
      }));
    });

    it('blocks non-hosts from deleting sessions', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('sessions').doc('ABC123').set({
          code: 'ABC123',
          hostId: 'host1',
          players: [],
          playerIds: [],
          updatedAt: new Date().toISOString()
        });
      });

      const participant = getContext('player1');
      await assertFails(participant.firestore().collection('sessions').doc('ABC123').delete());
    });
  });

  describe('gameWords collection', () => {
    it('allows registered players to read words', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('players').doc('player1').set({ displayName: 'Alice' });
        await adminDb.collection('gameWords').doc('word1').set({
          order: 1,
          context: 'Sample',
          correct: 'A',
          wrong: 'B'
        });
      });

      const player = getContext('player1');
      await assertSucceeds(player.firestore().collection('gameWords').doc('word1').get());

      const unauthenticated = testEnv.unauthenticatedContext();
      await assertFails(unauthenticated.firestore().collection('gameWords').doc('word1').get());
    });

    it('allows only admins or trusted services to write', async () => {
      const admin = getContext('adminUser', { admin: true });
      await assertSucceeds(admin.firestore().collection('gameWords').doc('word2').set({
        order: 2,
        context: 'Admin word',
        correct: 'A',
        wrong: 'B'
      }));

      const regular = getContext('player1');
      await assertFails(regular.firestore().collection('gameWords').doc('word3').set({
        order: 3,
        context: 'Regular word',
        correct: 'A',
        wrong: 'B'
      }));
    });
  });

  describe('leaderboard and gameResults collections', () => {
    it('allows players to read but not write leaderboard entries', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('players').doc('player1').set({ displayName: 'Alice' });
        await adminDb.collection('leaderboard').doc('entry1').set({ score: 100, userId: 'player1' });
      });

      const player = getContext('player1');
      const playerDb = player.firestore();
      await assertSucceeds(playerDb.collection('leaderboard').doc('entry1').get());
      await assertFails(playerDb.collection('leaderboard').doc('entry1').set({ score: 200 }));
    });

    it('allows trusted services to write leaderboard entries', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('players').doc('player1').set({ displayName: 'Alice' });
      });

      const functionCtx = getContext('functionUser', {
        firebase: { sign_in_provider: 'custom' }
      });
      await assertSucceeds(functionCtx.firestore().collection('leaderboard').doc('entry2').set({ score: 250 }));

      const serviceAccountCtx = getContext('serviceAccount:laotypo', {
        firebase: { sign_in_provider: 'custom' }
      });
      await assertSucceeds(serviceAccountCtx.firestore().collection('gameResults').doc('result2').set({ score: 300 }));
    });
  });
});
