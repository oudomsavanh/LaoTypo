import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase-config';

export const Header = ({ currentPage }) => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 border-b-2 border-yellow-500">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <img src="/LaoTypo-logo-04.png" alt="LaoTypo" className="h-8 w-auto" />
            <span className="text-yellow-500 font-bold text-xl">LaoTypo</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/host/dashboard" 
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'dashboard' 
                  ? 'bg-yellow-500/20 text-yellow-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/host/create" 
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'create' 
                  ? 'bg-yellow-500/20 text-yellow-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Create
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export const Card = ({ children, className = '' }) => (
  <div className={`bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-500/30 rounded-2xl shadow-xl p-6 ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5';
  const variants = {
    primary: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 hover:from-yellow-600 hover:to-yellow-700 shadow-lg',
    secondary: 'bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export const FormInput = ({ label, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-gray-300 text-sm font-medium mb-2">
      {label}
    </label>
    <input 
      className={`w-full px-4 py-3 rounded-xl bg-gray-700 border-2 ${
        error ? 'border-red-500' : 'border-gray-600'
      } text-gray-200 placeholder-gray-500 focus:border-yellow-500 focus:outline-none transition-colors`}
      {...props}
    />
    {error && (
      <p className="mt-1 text-sm text-red-500">{error}</p>
    )}
  </div>
);

export const FormSelect = ({ label, error, children, ...props }) => (
  <div className="mb-4">
    <label className="block text-gray-300 text-sm font-medium mb-2">
      {label}
    </label>
    <select 
      className={`w-full px-4 py-3 rounded-xl bg-gray-700 border-2 ${
        error ? 'border-red-500' : 'border-gray-600'
      } text-gray-200 focus:border-yellow-500 focus:outline-none transition-colors`}
      {...props}
    >
      {children}
    </select>
    {error && (
      <p className="mt-1 text-sm text-red-500">{error}</p>
    )}
  </div>
);