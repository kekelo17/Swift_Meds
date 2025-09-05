import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PharmacyAuthService } from '../../../../Back-end/services/pharmacy_auth_service.js';
import { 
  Mail, 
  ChevronLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import '../CSS/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await PharmacyAuthService.updatePassword(email);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
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
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600">
            {success 
              ? 'Check your email for a password reset link' 
              : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="auth-success">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Password reset email sent successfully!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
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

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="auth-footer">
              <span>Remember your password?</span>
              <Link to="/auth/signin" className="auth-link">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;