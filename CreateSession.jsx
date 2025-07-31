import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, functions } from './firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

// Import shared components
import { Header, Card, Button, FormInput, FormSelect } from './SharedComponents';

const CreateSession = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passages, setPassages] = useState([]);
  const [formData, setFormData] = useState({
    sessionName: '',
    passageId: '',
    level: 'Easy',
    maxLives: 3,
    timerPerWord: 10
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/auth');
      return;
    }

    // Load available passages
    loadPassages();
  }, [navigate]);

  const loadPassages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'passages'));
      const passagesList = [];
      querySnapshot.forEach((doc) => {
        passagesList.push({ id: doc.id, ...doc.data() });
      });
      setPassages(passagesList);
    } catch (error) {
      console.error('Error loading passages:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sessionName.trim()) {
      newErrors.sessionName = 'Session name is required';
    }
    
    if (!formData.passageId) {
      newErrors.passageId = 'Please select a passage';
    }
    
    if (formData.maxLives < 1 || formData.maxLives > 10) {
      newErrors.maxLives = 'Max lives must be between 1 and 10';
    }
    
    if (formData.timerPerWord < 5 || formData.timerPerWord > 60) {
      newErrors.timerPerWord = 'Timer must be between 5 and 60 seconds';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const createSessionFunction = httpsCallable(functions, 'createSession');
      const result = await createSessionFunction({
        name: formData.sessionName,
        passageId: formData.passageId,
        level: formData.level,
        maxLives: parseInt(formData.maxLives),
        timerPerWord: parseInt(formData.timerPerWord)
      });

      if (result.data.success) {
        navigate('/host/dashboard');
      } else {
        throw new Error(result.data.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setErrors({ general: error.message || 'Failed to create session. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header currentPage="create" />
      
      <main className="p-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-200">Create New Session</h1>
          <p className="text-gray-400 mt-2">Set up a new game session for your players</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-400">
                {errors.general}
              </div>
            )}

            <FormInput
              label="Session Name"
              name="sessionName"
              type="text"
              placeholder="Enter a name for your session"
              value={formData.sessionName}
              onChange={handleInputChange}
              error={errors.sessionName}
              required
            />

            <FormSelect
              label="Select Passage"
              name="passageId"
              value={formData.passageId}
              onChange={handleInputChange}
              error={errors.passageId}
              required
            >
              <option value="">Choose a passage...</option>
              {passages.map((passage) => (
                <option key={passage.id} value={passage.id}>
                  {passage.title} ({passage.level})
                </option>
              ))}
            </FormSelect>

            <FormSelect
              label="Difficulty Level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              error={errors.level}
              required
            >
              <option value="Easy">Easy (1 point per word)</option>
              <option value="Medium">Medium (2 points per word)</option>
              <option value="Hard">Hard (3 points per word)</option>
            </FormSelect>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Max Lives"
                name="maxLives"
                type="number"
                min="1"
                max="10"
                placeholder="3"
                value={formData.maxLives}
                onChange={handleInputChange}
                error={errors.maxLives}
                required
              />

              <FormInput
                label="Timer per Word (seconds)"
                name="timerPerWord"
                type="number"
                min="5"
                max="60"
                placeholder="10"
                value={formData.timerPerWord}
                onChange={handleInputChange}
                error={errors.timerPerWord}
                required
              />
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent mr-2"></span>
                    Creating...
                  </>
                ) : (
                  'Create Session'
                )}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => navigate('/host/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default CreateSession;