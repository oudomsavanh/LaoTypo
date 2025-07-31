import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase-config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

// Import shared components
import { Header, Card, Button } from './SharedComponents';

const StatCard = ({ icon, label, value }) => (
  <Card className="text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-gray-400 text-sm">{label}</div>
    <div className="text-2xl font-bold text-yellow-500">{value}</div>
  </Card>
);

const SessionCard = ({ session, onViewDetails }) => {
  const statusColors = {
    waiting: 'text-yellow-500',
    active: 'text-green-500',
    completed: 'text-gray-500'
  };

  return (
    <Card className="hover:border-yellow-500/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-200">{session.name || `Session ${session.code}`}</h3>
          <p className="text-gray-400 text-sm">Code: {session.code}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[session.status]} bg-gray-800`}>
          {session.status}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Level:</span>
          <p className="text-gray-300 font-medium">{session.level}</p>
        </div>
        <div>
          <span className="text-gray-500">Players:</span>
          <p className="text-gray-300 font-medium">{session.playerCount || 0}</p>
        </div>
        <div>
          <span className="text-gray-500">Max Lives:</span>
          <p className="text-gray-300 font-medium">{session.maxLives}</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="primary" 
          className="flex-1 py-2 text-sm"
          onClick={() => onViewDetails(session.id)}
        >
          View Details
        </Button>
        {session.status === 'waiting' && (
          <Button 
            variant="secondary" 
            className="flex-1 py-2 text-sm"
            onClick={() => window.location.href = `/session/${session.id}/waiting`}
          >
            Enter Room
          </Button>
        )}
      </div>
    </Card>
  );
};

const HostDashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalPlayers: 0,
    avgScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/auth');
      return;
    }

    // Subscribe to sessions
    const q = query(
      collection(db, 'sessions_meta'),
      where('hostId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionsData = [];
      let totalPlayers = 0;
      let totalScore = 0;
      let scoreCount = 0;

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        sessionsData.push(data);
        totalPlayers += data.playerCount || 0;
        if (data.avgScore) {
          totalScore += data.avgScore;
          scoreCount++;
        }
      });

      setSessions(sessionsData);
      setStats({
        totalSessions: sessionsData.length,
        totalPlayers,
        avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleViewDetails = (sessionId) => {
    navigate(`/session/${sessionId}/report`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header currentPage="dashboard" />
      
      <main className="p-4 max-w-6xl mx-auto">
        {/* Stats Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-200 mb-6">Host Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon="🎮" label="Total Sessions" value={stats.totalSessions} />
            <StatCard icon="👥" label="Total Players" value={stats.totalPlayers} />
            <StatCard icon="🏆" label="Average Score" value={`${stats.avgScore}%`} />
          </div>
        </div>

        {/* Create New Session Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-200">Your Sessions</h2>
          <Button 
            variant="primary"
            onClick={() => navigate('/host/create')}
            className="flex items-center gap-2"
          >
            <span>➕</span> Create New Session
          </Button>
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          </div>
        ) : sessions.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No sessions created yet</p>
            <Button variant="primary" onClick={() => navigate('/host/create')}>
              Create Your First Session
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HostDashboard;