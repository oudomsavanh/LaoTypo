import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db, rtdb } from './firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-config';
import QRCode from 'qrcode';

// Import shared components
import { Card, Button } from './SharedComponents';

const PlayerCard = ({ player, isHost }) => (
  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
        <span className="text-yellow-500 font-bold">
          {player.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div>
        <p className="text-gray-200 font-medium">{player.name}</p>
        {isHost && <p className="text-gray-500 text-xs">Host</p>}
      </div>
    </div>
    <div className="text-green-500 text-sm">Ready</div>
  </div>
);

const CountdownTimer = ({ seconds }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="text-center">
      <h2 className="text-4xl font-bold text-yellow-500 mb-4">Game Starting!</h2>
      <div className="text-8xl font-bold text-white animate-pulse">
        {seconds}
      </div>
    </div>
  </div>
);

const WaitingRoom = () => {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      navigate('/join');
      return;
    }

    // Load session metadata
    loadSessionData();
    
    // Subscribe to real-time updates
    const playersRef = ref(rtdb, `sessions/${sessionId}/players`);
    const statusRef = ref(rtdb, `sessions/${sessionId}/status`);
    const messagesRef = ref(rtdb, `sessions/${sessionId}/messages`);

    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersList = Object.entries(data).map(([id, player]) => ({
          id,
          ...player
        }));
        setPlayers(playersList);
      }
    });

    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (status === 'starting') {
        startCountdown();
      } else if (status === 'active') {
        navigate(`/session/${sessionId}/play`);
      }
    });

    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.entries(data)
          .map(([id, msg]) => ({ id, ...msg }))
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(-50); // Keep last 50 messages
        setMessages(messagesList);
      }
    });

    return () => {
      unsubscribePlayers();
      unsubscribeStatus();
      unsubscribeMessages();
    };
  }, [sessionId, navigate]);

  const loadSessionData = async () => {
    try {
      // Get session metadata from Firestore
      const sessionDoc = await getDoc(doc(db, 'sessions_meta', sessionId));
      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }
      
      const sessionData = sessionDoc.data();
      setSession(sessionData);
      
      // Check if current user is the host
      if (auth.currentUser && auth.currentUser.uid === sessionData.hostId) {
        setIsHost(true);
      }

      // Generate QR code
      const joinUrl = `${window.location.origin}/join?code=${sessionData.code}`;
      const qrDataUrl = await QRCode.toDataURL(joinUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#e2b714',
          light: '#2c2e31'
        }
      });
      setQrCodeUrl(qrDataUrl);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading session:', error);
      navigate('/join');
    }
  };

  const startCountdown = () => {
    let seconds = 3;
    setCountdown(seconds);
    
    const interval = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        setCountdown(seconds);
      } else {
        clearInterval(interval);
        setCountdown(null);
      }
    }, 1000);
  };

  const handleStartGame = async () => {
    if (!isHost || players.length === 0) return;

    try {
      const startGameFunction = httpsCallable(functions, 'startGame');
      await startGameFunction({ sessionId });
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const messagesRef = ref(rtdb, `sessions/${sessionId}/messages`);
      await push(messagesRef, {
        playerId: auth.currentUser?.uid || sessionStorage.getItem('playerId'),
        playerName: auth.currentUser?.displayName || sessionStorage.getItem('playerName') || 'Guest',
        text: chatInput.trim(),
        timestamp: serverTimestamp()
      });
      setChatInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(session.code);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {countdown && <CountdownTimer seconds={countdown} />}
      
      <main className="p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-200 mb-2">Waiting Room</h1>
          <p className="text-gray-400">{session.name || 'Game Session'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Info & QR Code */}
          <Card className="lg:col-span-1">
            <h2 className="text-xl font-bold text-yellow-500 mb-4">Session Info</h2>
            
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm mb-2">Session Code</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-yellow-500 tracking-wider">
                  {session.code}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy code"
                >
                  📋
                </button>
              </div>
            </div>

            {qrCodeUrl && (
              <div className="text-center mb-6">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto rounded-lg" />
                <p className="text-gray-500 text-xs mt-2">Scan to join</p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Level:</span>
                <span className="text-gray-300">{session.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Max Lives:</span>
                <span className="text-gray-300">{session.maxLives}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Timer:</span>
                <span className="text-gray-300">{session.timerPerWord}s</span>
              </div>
            </div>

            {isHost && (
              <Button
                variant="primary"
                className="w-full mt-6"
                onClick={handleStartGame}
                disabled={players.length === 0}
              >
                Start Game ({players.length} players)
              </Button>
            )}
          </Card>

          {/* Players List */}
          <Card className="lg:col-span-1">
            <h2 className="text-xl font-bold text-yellow-500 mb-4">
              Players ({players.length})
            </h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {players.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Waiting for players to join...
                </p>
              ) : (
                players.map((player) => (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    isHost={player.id === session.hostId}
                  />
                ))
              )}
            </div>
          </Card>

          {/* Chat */}
          <Card className="lg:col-span-1 flex flex-col">
            <h2 className="text-xl font-bold text-yellow-500 mb-4">Chat</h2>
            
            <div className="flex-1 overflow-y-auto max-h-96 mb-4 space-y-2">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No messages yet...
                </p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className="text-yellow-500 font-medium">
                      {msg.playerName}:
                    </span>{' '}
                    <span className="text-gray-300">{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-500 focus:border-yellow-500 focus:outline-none transition-colors"
                maxLength={100}
              />
              <Button type="submit" variant="secondary" className="px-4 py-2">
                Send
              </Button>
            </form>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <h3 className="text-lg font-bold text-yellow-500 mb-3">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <span className="text-yellow-500 font-bold">1.</span> Wait for all players to join
            </div>
            <div>
              <span className="text-yellow-500 font-bold">2.</span> Host will start the game when ready
            </div>
            <div>
              <span className="text-yellow-500 font-bold">3.</span> Click words in the correct order to score points
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default WaitingRoom;