import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage.jsx';
import DashboardRouter from "./pages/Dashboard-Route.jsx";
import SignIn from './pages/auth/signin.jsx';
import { RoleSelection, ClientSignUp, PharmacySignUp } from './pages/auth/signup.jsx';
import OtpVerification from './pages/auth/otp-verification.jsx';
import ForgetPassword from './pages/auth/forgot-password.jsx';
import { usePharmacyAuth } from '../../Back-end/hooks/usePharmacyAuth.js';

const App = () => {
  const { user, loading } = usePharmacyAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
          <p className="text-green-700 font-medium">Loading Swift Meds...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/Dashboard-Route" /> : <Homepage />} />
        <Route path="/auth/signin" element={user ? <Navigate to="/Dashboard-Route" /> : <SignIn />} />
        
        {/* Signup routes - multi-step process */}
        <Route path="/auth/signup" element={user ? <Navigate to="/Dashboard-Route" /> : <RoleSelection />} />
        <Route path="/auth/signup/client" element={user ? <Navigate to="/Dashboard-Route" /> : <ClientSignUp />} />
        <Route path="/auth/signup/pharmacy" element={user ? <Navigate to="/Dashboard-Route" /> : <PharmacySignUp />} />
        
        {/* OTP Verification */}
        <Route path="/auth/otp-verification" element={user ? <Navigate to="/Dashboard-Route" /> : <OtpVerification />} />
        
        {/* Other auth routes */}
        <Route path="/auth/forgot-password" element={user ? <Navigate to="/Dashboard-Route" /> : <ForgetPassword />} />
        
        {/* Protected routes */}
        <Route 
          path="/Dashboard-Route" 
          element={user ? <DashboardRouter /> : <Navigate to="/auth/signin" />} 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to={user ? "/Dashboard-Route" : "/"} />} />
      </Routes>
    </Router>
  );
};

export default App;