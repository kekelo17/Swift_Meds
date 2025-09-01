import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage.jsx';
import DashboardRouter from "./pages/Dashboard-Route.jsx";
import SignIn from './pages/auth/signin.jsx';
import SignUp from './pages/auth/signup.jsx';
import ForgetPassword from './pages/auth/forgot-password.jsx';
import { usePharmacyAuth } from '../../Back-end/hooks/usePharmacyAuth.js';

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
        <Route path="/" element={user ? <Navigate to="/Dashboard-Route" /> : <Homepage />} />
        <Route path="/auth/signin" element={user ? <Navigate to="/Dashboard-Route" /> : <SignIn />} />
        
        {/* Protected routes */}
        <Route 
          path="/Dashboard-Route" 
          element={user ? <DashboardRouter /> : <Navigate to="/auth/signin" />} 
        />
        <Route path="/auth/signup" element={user ? <Navigate to="/Dashboard-Route" /> : <SignUp />} />
        <Route path="/auth/forgot-password" element={user ? <Navigate to="/Dashboard-Route" /> : <ForgetPassword />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to={user ? "/Dashboard-Route" : "/"} />} />
      </Routes>
    </Router>
  );
};

export default App;