import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PharmacyAuthService } from '../../../../Back-end/services/pharmacy_auth_service.js';
import { 
  Mail, 
  ChevronLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Reset Password</h2>
          <p className="text-gray-600 text-lg">
            {success 
              ? 'Check your email for a password reset link' 
              : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {error && (
          <div className="flex items-center bg-red-50 text-red-600 p-4 rounded-xl mb-6 animate-fade-in">
            <AlertCircle className="h-5 w-5 mr-3" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex items-center bg-green-50 text-green-600 p-4 rounded-xl mb-6 animate-fade-in">
            <CheckCircle className="h-5 w-5 mr-3" />
            <span className="text-sm">Password reset email sent successfully!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-75 shadow-md hover:shadow-lg"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/auth/signin" className="text-green-600 hover:text-green-700 font-medium underline-offset-2">
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