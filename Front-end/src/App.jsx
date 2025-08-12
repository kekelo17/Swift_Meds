/*
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import PharmacyDashboard from "./pages/dashboard.jsx"; 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Homepage />} /> 
        <Route path='/dashboard' element={<PharmacyDashboard />} /> 
      </Routes>
    </Router>
  )
}

export default App
*/

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import PharmacyDashboard from "./pages/dashboard.jsx";
import SignIn from './pages/auth/signin.jsx';
import SignUp from './pages/auth/signup.jsx';
import ForgetPassword from './pages/auth/forgot-password.jsx';
import { usePharmacyAuth } from '../../Back-end/services/pharmacy_auth_service.js';

const App = () => {
  const { user, loading } = usePharmacyAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Homepage />} />
        <Route path="/auth/signin" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={user ? <PharmacyDashboard /> : <Navigate to="/auth/signin" />} 
        />
        <Route path="/auth/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
        <Route path="/auth/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgetPassword />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
      </Routes>
    </Router>
  );
};

export default App;