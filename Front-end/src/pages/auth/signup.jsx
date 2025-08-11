import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PharmacyAuthService } from '/home/keumoe/Desktop/PHARMAP/Back-end/src/service/pharmacy_auth_service.js';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ChevronLeft,
  AlertCircle,
  Shield
} from 'lucide-react';
import '../CSS/auth.css';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await PharmacyAuthService.signUp(email, password, {
        fullName,
        role
      });
      if (error) throw error;
      navigate('./otp-verification');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-gray-900">Join Swift Meds</h2>
          <p className="text-gray-600">Create your account</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <User className="input-icon" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-group">
              <Mail className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="input-group">
              <Shield className="input-icon" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
              >
                <option value="user">Patient</option>
                <option value="pharmacy">Pharmacy Staff</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="./sign-in" className="auth-link">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;