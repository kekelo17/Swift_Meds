import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PharmacyAuthService } from '../../../../Back-end/services/pharmacy_auth_service.js';
import { 
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Mail,
  Clock,
  Shield
} from 'lucide-react';

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const navigate = useNavigate();
  const location = useLocation();
  const otpRefs = useRef([]);
  
  // Get email and role from navigation state
  const email = location.state?.email || '';
  const role = location.state?.role || 'client';
  const message = location.state?.message || 'Check your email for verification code';

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        if (digits.length === 6) {
          setOtp(digits.split(''));
          otpRefs.current[5]?.focus();
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const otpCode = otp.join('');
      const result = await PharmacyAuthService.verifyEmail(otpCode, role);
      
      if (result.success) {
        setSuccess('Email verified successfully!');
        // Navigate based on role
        setTimeout(() => {
          navigate(getDashboardRoute(role), { 
            state: { message: 'Email verified successfully!' }
          });
        }, 2000);
      } else {
        setError(result.message || 'Invalid OTP code');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await PharmacyAuthService.resendVerification(email);
      if (result.success) {
        setSuccess('Verification code resent successfully!');
        setCountdown(60);
        setCanResend(false);
      } else {
        setError(result.message || 'Failed to resend code');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const getDashboardRoute = (userRole) => {
    switch (userRole.toLowerCase()) {
      case 'admin':
        return '/dashboards/Admin-Dashboard';
      case 'pharmacist':
        return '/dashboards/Pharmacy-Dashboard';
      case 'client':
      default:
        return '/dashboards/Client-Dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <button 
          onClick={() => navigate('/auth/signup')} 
          className="absolute top-6 left-6 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Verify Your Email</h2>
          <p className="text-gray-600 text-lg">{message}</p>
          <p className="text-sm text-gray-500 mt-2">
            We've sent a 6-digit code to <strong className="text-gray-900">{email}</strong>
          </p>
        </div>

        {role === 'pharmacy' && (
          <div className="flex items-start bg-amber-50 text-amber-700 p-4 rounded-xl mb-6 animate-fade-in">
            <Shield className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Pending Approval</p>
              <p className="text-xs">After verification, your pharmacy account will be reviewed by our admin team.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center bg-red-50 text-red-600 p-4 rounded-xl mb-6 animate-fade-in">
            <AlertCircle className="h-5 w-5 mr-3" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center bg-green-50 text-green-600 p-4 rounded-xl mb-6 animate-fade-in">
            <CheckCircle className="h-5 w-5 mr-3" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => otpRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-full h-14 text-center text-2xl font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 disabled:opacity-50 bg-white"
                disabled={loading}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.some(digit => !digit)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-75 shadow-md hover:shadow-lg"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-green-600 hover:text-green-700 font-medium underline-offset-2 transition-colors disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Resend in {countdown}s</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;