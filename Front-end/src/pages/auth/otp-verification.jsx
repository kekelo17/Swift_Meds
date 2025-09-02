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
import '../CSS/auth.css';

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
        // Move to previous input if current is empty
        otpRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
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

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const response = await PharmacyAuthService.verifyOtp(email, otpCode);
      
      if (response.error) {
        throw new Error(response.error.message || 'Verification failed');
      }

      setSuccess('Email verified successfully!');
      
      // Navigate based on role with different messages
      setTimeout(() => {
        if (role === 'pharmacy') {
          // Pharmacy accounts need approval
          navigate('/auth/signin', {
            state: {
              message: 'Email verified! Your pharmacy account is pending admin approval. You will be notified once approved.',
              type: 'info'
            }
          });
        } else {
          // Client accounts can sign in immediately
          navigate('/auth/signin', {
            state: {
              message: 'Email verified successfully! You can now sign in.',
              type: 'success'
            }
          });
        }
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    
    try {
      await PharmacyAuthService.resendOtp(email);
      setSuccess('Verification code resent successfully!');
      setCanResend(false);
      setCountdown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  // Redirect if no email in state
  if (!email) {
    return (
      <Navigate to="/auth/signup" replace />
    );
  }

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
          <div className="verification-icon">
            <Mail className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="text-gray-600 mb-2">{message}</p>
          <p className="text-sm text-gray-500">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        {role === 'pharmacy' && (
          <div className="approval-notice mb-4">
            <div className="approval-icon">
              <Shield className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-amber-700 font-medium">Pending Approval</p>
              <p className="text-xs text-amber-600">After verification, your pharmacy account will be reviewed by our admin team.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="auth-error">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-input-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => otpRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                disabled={loading}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.some(digit => !digit)}
            className="auth-button"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="resend-section">
            <p className="text-sm text-gray-600 text-center">
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="resend-button"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
            ) : (
              <div className="countdown">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Resend in {countdown}s
                </span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;