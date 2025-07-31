import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-config';

// Import shared components
import { Card, Button, FormInput } from './SharedComponents';

const JoinSession = () => {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!sessionCode || sessionCode.length !== 6) {
      setError('Please enter a valid 6-character session code');
      return;
    }

    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    setLoading(true);

    try {
      // Call Firebase function to join session
      const joinSessionFunction = httpsCallable(functions, 'joinSession');
      const result = await joinSessionFunction({
        code: sessionCode.toUpperCase(),
        displayName: displayName.trim()
      });

      if (result.data.success) {
        // Store session info and redirect to waiting room
        sessionStorage.setItem('sessionId', result.data.sessionId);
        sessionStorage.setItem('playerName', displayName);
        navigate(`/session/${result.data.sessionId}/waiting`);
      } else {
        throw new Error(result.data.error || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      
      // Handle specific error cases
      if (error.message.includes('not found')) {
        setError('Session not found. Please check the code and try again.');
      } else if (error.message.includes('full')) {
        setError('This session is full. Please try another session.');
      } else if (error.message.includes('already started')) {
        setError('This session has already started.');
      } else {
        setError('Failed to join session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    // Force uppercase and remove non-alphanumeric characters
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSessionCode(value);
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/LaoTypo-logo-04.png" alt="LaoTypo" className="h-16 w-auto" />
            <img src="/Gecko.png" alt="Gecko Mascot" className="h-16 w-16 rounded-full border-2 border-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-500">Join a Session</h1>
          <p className="text-gray-400 mt-2">Enter the session code to join the game</p>
        </div>

        {/* Join Form Card */}
        <Card>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Session Code
              </label>
              <input
                type="text"
                value={sessionCode}
                onChange={handleCodeChange}
                maxLength={6}
                placeholder="ABC123"
                className="w-full px-4 py-4 rounded-xl bg-gray-700 border-2 border-gray-600 text-gray-200 text-center text-2xl font-bold tracking-wider placeholder-gray-500 focus:border-yellow-500 focus:outline-none transition-colors uppercase"
                required
                autoFocus
              />
              <p className="text-gray-500 text-xs mt-2 text-center">
                Enter the 6-character code shared by your host
              </p>
            </div>

            <FormInput
              label="Your Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || sessionCode.length !== 6 || !displayName.trim()}
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent mr-2"></span>
                  Joining...
                </>
              ) : (
                'Join Session'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-center text-gray-400 text-sm">
              Don't have a code?{' '}
              <Link to="/" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                Return to Home
              </Link>
            </p>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Make sure you have the correct session code from your host.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinSession;