// signin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Info,
  Pill
} from 'lucide-react';
import { authAPI } from '../../api/apiClient.js';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stateMessage, setStateMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    console.log('Current auth state:', { 
      hasToken: !!token, 
      hasUser: !!user,
      user: user ? JSON.parse(user) : null 
    });
  }, []);

  // Handle navigation state messages
  useEffect(() => {
    if (location.state?.message) {
      setStateMessage(location.state.message);
      setMessageType(location.state.type || 'info');
      
      // Clear the message after 10 seconds
      const timer = setTimeout(() => {
        setStateMessage('');
        setMessageType('');
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Function to determine dashboard route based on user role
  const getDashboardRoute = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return '/dashboards/admin';
      case 'pharmacist':
        return '/dashboards/pharmacist';
      case 'client':
      default:
        return '/dashboards/client';
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    if (!email.trim() || !password) {
      setError('Email address and password are required');
      setLoading(false);
      return;
    }
  
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
  
    try {
      console.log('Attempting to sign in...');
      const response = await authAPI.signin({
        email: email.trim().toLowerCase(),
        password: password
      });
      
      console.log('Sign in response:', response.data);
  
      if (response.data.success) {
        // Store auth data in localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Navigate to appropriate dashboard
        navigate(getDashboardRoute(response.data.user.role), {
          state: { message: 'Welcome back!' }
        });
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.response?.data?.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-6">
            <Pill className="h-10 w-10 text-green-600 mr-3" />
            <h2 className="text-4xl font-bold text-gray-900">SwiftMeds</h2>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h3>
          <p className="text-gray-600 text-lg">Please sign in to your account</p>
        </div>

        {/* State messages */}
        {stateMessage && (
          <div className={`flex items-center p-4 rounded-xl mb-6 animate-fade-in ${
            messageType === 'success' ? 'bg-green-50 text-green-600' :
            messageType === 'error' ? 'bg-red-50 text-red-600' :
            'bg-blue-50 text-blue-600'
          }`}>
            {messageType === 'success' ? <CheckCircle className="h-5 w-5 mr-3" /> :
             messageType === 'error' ? <AlertCircle className="h-5 w-5 mr-3" /> :
             <Info className="h-5 w-5 mr-3" />}
            <span className="text-sm">{stateMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center bg-red-50 text-red-600 p-4 rounded-xl mb-6 animate-fade-in">
            <AlertCircle className="h-5 w-5 mr-3" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Use the email address you registered with</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium underline-offset-2">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-75 shadow-md hover:shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/auth/signup')}
            className="w-full bg-white text-green-600 py-3 rounded-lg font-medium border border-green-500 hover:bg-green-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Create an account
          </button>

          <div className="text-center mt-6 text-sm text-gray-600">
            Having trouble? Contact support at{' '}
            <a href="#" className="text-green-600 hover:text-green-700 font-medium underline-offset-2">
              support@swiftmeds.com
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;