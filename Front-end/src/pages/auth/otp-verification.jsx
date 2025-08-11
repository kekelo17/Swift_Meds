import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PharmacyAuthService } from '/home/keumoe/Desktop/PHARMAP/Back-end/src/service/pharmacy_auth_service.js';
import { 
  Lock, 
  ChevronLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import '../CSS/auth.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const { error } = await PharmacyAuthService.verifyOTP(email, otpCode);
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to verify OTP');
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
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="text-gray-600">
            {success 
              ? 'Verification successful! Redirecting...' 
              : 'Enter the 6-digit code sent to your email'}
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
            <span>Email verified successfully!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="otp-input"
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <div className="auth-footer">
              <span>Didn't receive a code?</span>
              <button type="button" className="auth-link">
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;