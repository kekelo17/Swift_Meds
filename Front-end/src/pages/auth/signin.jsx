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
import '../CSS/auth.css';
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
        return '/dashboards/Admin-dashboard';
      case 'pharmacist':
        return '/dashboards/Pharmacy-dashboard';
      case 'client':
        return '/dashboards/Client-dashboard';
      default:
        return '/dashboards/Client-dashboard';
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
      const response = await authAPI.signin({
        identifier: email.trim().toLowerCase(),
        password: password
      });
      
      if (response.data.success) {
        // Store auth data in localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        const userRole = response.data.user.role;
        const dashboardRoute = getDashboardRoute(userRole);
        
        // Check if pharmacist account is approved
        if (userRole === 'pharmacist' && response.data.user.roleData?.pharmacy?.status === 'pending') {
          navigate(dashboardRoute, { 
            replace: true,
            state: { 
              user: response.data.user,
              message: 'Your pharmacy account is pending admin approval. Some features may be limited.',
              type: 'info'
            }
          });
        } else {
          navigate(dashboardRoute, { 
            replace: true,
            state: { 
              user: response.data.user,
              message: `Welcome back, ${response.data.user.full_name}!`,
              type: 'success'
            }
          });
        }
      }

    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.error || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getMessageClass = () => {
    switch (messageType) {
      case 'success':
        return 'auth-success';
      case 'error':
        return 'auth-error';
      case 'info':
      default:
        return 'auth-info';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="auth-header">
          <div className="flex items-center justify-center mb-4">
            <Pill className="h-8 w-8 text-green-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Swift Meds</h2>
          </div>
          <p className="text-gray-600">Welcome back! Sign in to your account</p>
        </div>

        {/* State messages from navigation */}
        {stateMessage && (
          <div className={getMessageClass()}>
            {getMessageIcon()}
            <span>{stateMessage}</span>
            <button
              onClick={() => setStateMessage('')}
              className="ml-auto text-current opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Regular error messages */}
        {error && (
          <div className="auth-error">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <Mail className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="form-input"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use the email address you registered with
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="form-footer">
            <Link to="/auth/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/auth/signup')}
            className="auth-secondary-button"
          >
            Create an account
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Having trouble? Contact support at{' '}
            <a href="mailto:support@swiftmeds.com" className="text-blue-600 hover:underline">
              support@swiftmeds.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;