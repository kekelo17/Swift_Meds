// RoleSelection.jsx - Initial role selection component

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { PharmacyAuthService } from '../../../../Back-end/services/pharmacy_auth_service.js';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Building2,
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  Pill,
  FileText,
  Clock
} from 'lucide-react';
import '../CSS/auth.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roleOptions = [
    {
      id: 'client',
      title: 'Patient/Client',
      description: 'I want to find and reserve medications from pharmacies',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      features: ['Search medications', 'Make reservations', 'Track orders', 'Find nearby pharmacies']
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy Staff',
      description: 'I represent a pharmacy and want to manage inventory and reservations',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      features: ['Manage inventory', 'Handle reservations', 'Update availability', 'Serve customers']
    }
  ];

  const handleRoleSelect = (role) => {
    navigate(`/auth/signup/${role}`, { 
      state: { selectedRole: role }
    });
  };

  return (
    <div className="auth-container">
      <div className="role-selection-container">
        <button 
          onClick={() => navigate('/')} 
          className="back-button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="auth-header text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Pill className="h-8 w-8 text-blue-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Swift Meds</h2>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Join our community</h3>
          <p className="text-gray-600">Choose your account type to get started</p>
        </div>

        <div className="role-grid">
          {roleOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                onClick={() => handleRoleSelect(option.id)}
                className="role-card group cursor-pointer"
              >
                <div className={`role-icon-wrapper bg-gradient-to-r ${option.color}`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                
                <div className="role-content">
                  <h4 className="role-title">{option.title}</h4>
                  <p className="role-description">{option.description}</p>
                  
                  <ul className="role-features">
                    {option.features.map((feature, index) => (
                      <li key={index} className="role-feature">
                        <div className="feature-dot"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="role-arrow">
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="auth-footer text-center mt-8">
          <span className="text-gray-600">Already have an account?</span>
          <button
            onClick={() => navigate('/auth/signin')}
            className="auth-link ml-2"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

// ClientSignUp.jsx - Client-specific signup form

const ClientSignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastAttempt, setLastAttempt] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Rate limiting
    const now = Date.now();
    if (now - lastAttempt < 30000) {
      const timeLeft = Math.ceil((30000 - (now - lastAttempt)) / 1000);
      setError(`Please wait ${timeLeft} seconds before trying again`);
      setLoading(false);
      return;
    }
    setLastAttempt(now);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await PharmacyAuthService.signUp(formData.email, formData.password, {
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        role: 'client'
      });
      
      navigate('/auth/otp-verification', { 
        state: { 
          email: formData.email, 
          message: 'Check your email for verification code',
          role: 'client'
        }
      });
      
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button 
          onClick={() => navigate('/auth/signup')} 
          className="back-button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="auth-header">
          <h2 className="text-2xl font-bold text-gray-900">Create Patient Account</h2>
          <p className="text-gray-600">Join Swift Meds as a patient</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-group">
                <User className="input-icon" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <div className="input-group">
                <Mail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row-split">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="input-group">
                <Phone className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+237 xxx xxx xxx"
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <div className="input-group">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Address</label>
              <div className="input-group">
                <MapPin className="input-icon" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row-split">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
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
              <label className="form-label">Confirm Password *</label>
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Creating account...' : 'Create Patient Account'}
          </button>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/auth/signin" className="auth-link">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// PharmacySignUp.jsx - Pharmacy-specific signup form

const PharmacySignUp = () => {
  const [formData, setFormData] = useState({
    pharmacyName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    operatingHours: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastAttempt, setLastAttempt] = useState(0);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Rate limiting
    const now = Date.now();
    if (now - lastAttempt < 30000) {
      const timeLeft = Math.ceil((30000 - (now - lastAttempt)) / 1000);
      setError(`Please wait ${timeLeft} seconds before trying again`);
      setLoading(false);
      return;
    }
    setLastAttempt(now);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await PharmacyAuthService.signUp(formData.email, formData.password, {
        pharmacyName: formData.pharmacyName,
        ownerName: formData.ownerName,
        phone: formData.phone,
        address: formData.address,
        licenseNumber: formData.licenseNumber,
        operatingHours: formData.operatingHours,
        role: 'pharmacy',
        status: 'pending' // Pharmacy accounts need approval
      });
      
      navigate('/auth/otp-verification', { 
        state: { 
          email: formData.email, 
          message: 'Check your email for verification code. Your pharmacy account will be reviewed for approval.',
          role: 'pharmacy'
        }
      });
      
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button 
          onClick={() => navigate('/auth/signup')} 
          className="back-button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="auth-header">
          <h2 className="text-2xl font-bold text-gray-900">Create Pharmacy Account</h2>
          <p className="text-gray-600">Register your pharmacy with Swift Meds</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="approval-notice">
          <div className="approval-icon">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-amber-700 font-medium">Approval Required</p>
            <p className="text-xs text-amber-600">Pharmacy accounts require admin approval before activation.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row-split">
            <div className="form-group">
              <label className="form-label">Pharmacy Name *</label>
              <div className="input-group">
                <Building2 className="input-icon" />
                <input
                  type="text"
                  name="pharmacyName"
                  value={formData.pharmacyName}
                  onChange={handleInputChange}
                  placeholder="Enter pharmacy name"
                  required
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Owner/Manager Name *</label>
              <div className="input-group">
                <User className="input-icon" />
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="Enter owner name"
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <div className="input-group">
                <Mail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter pharmacy email"
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row-split">
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <div className="input-group">
                <Phone className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+237 xxx xxx xxx"
                  required
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">License Number *</label>
              <div className="input-group">
                <FileText className="input-icon" />
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="Pharmacy license number"
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Address *</label>
              <div className="input-group">
                <MapPin className="input-icon" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter pharmacy address"
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Operating Hours</label>
              <div className="input-group">
                <Clock className="input-icon" />
                <input
                  type="text"
                  name="operatingHours"
                  value={formData.operatingHours}
                  onChange={handleInputChange}
                  placeholder="e.g., Mon-Fri: 8AM-6PM, Sat: 9AM-4PM"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row-split">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
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
              <label className="form-label">Confirm Password *</label>
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Creating account...' : 'Create Pharmacy Account'}
          </button>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/auth/signin" className="auth-link">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export { RoleSelection, ClientSignUp, PharmacySignUp };