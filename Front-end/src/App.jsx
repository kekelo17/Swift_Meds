import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage.jsx';
import DashboardRouter from "./pages/Dashboard-Route.jsx";
import AuthRouter from "./pages/Auth-Route.jsx";
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

  console.log('App.jsx - Current user:', user); // Debug log

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Homepage />} />
        
        {/* Auth routes - accessible when not logged in OR when user wants to login/signup */}
        <Route path="/auth/*" element={
          // Don't redirect if user is on auth routes - let them access signin/signup
          <AuthRouter />
        } />
        
        {/* Dashboard routes - only accessible when logged in */}
        <Route path="/dashboards/*" element={
          user ? (
            <DashboardRouter userRole={user.role} />
          ) : (
            <Navigate to="/auth/signin" replace />
          )
        } />
        
        {/* Redirect based on auth status */}
        <Route path="*" element={
          user ? (
            <Navigate to={`/dashboards/${user.role?.toLowerCase()}`} replace />
          ) : (
            <Navigate to="/" replace />
          )
        } />
      </Routes>
    </Router>
  );
};

export default App;