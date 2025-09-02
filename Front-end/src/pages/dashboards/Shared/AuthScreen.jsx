import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to SwiftMeds</h2>
        <p className="text-gray-600 mb-8">
          Please sign in to access your SwiftMeds dashboard
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate("/auth/signin")}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Sign In
          </button>
          
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => navigate("/auth/signup")}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;