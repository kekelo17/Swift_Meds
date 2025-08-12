import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, MapPin, Calendar, LogIn, UserPlus } from 'lucide-react';

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">Swift Meds</span>
          </Link>
          
          <nav className="flex space-x-4">
            <button 
              onClick={() => navigate("/auth/signin")}
              className="flex items-center space-x-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </button>
            <button 
              onClick={() => navigate("/auth/signup")}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              <span>Sign Up</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow container mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-12 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Your Pharmacy, <span className="text-green-600">Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage medications, track prescriptions, and connect with pharmacies - all in one place.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate("/auth/signup")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Get Started
            </button>
            <button 
              onClick={() => navigate("/auth/signin")}
              className="px-6 py-3 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              Existing User
            </button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-8 w-full max-w-md h-80 flex items-center justify-center">
            <div className="text-center">
              <Package className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Your pharmacy management solution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Swift Meds?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Medication Management</h3>
              <p className="text-gray-600">Track all your prescriptions in one convenient dashboard.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pharmacy Locator</h3>
              <p className="text-gray-600">Find nearby pharmacies with real-time availability.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reservation System</h3>
              <p className="text-gray-600">Book medications in advance for quick pickup.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-bold text-green-600">Swift Meds</span>
              <p className="text-gray-600 mt-2">Simplifying pharmacy management</p>
            </div>
            
            <div className="flex space-x-6">
              <Link to="/about" className="text-gray-600 hover:text-green-600 transition-colors">About Us</Link>
              <Link to="/contact" className="text-gray-600 hover:text-green-600 transition-colors">Contact</Link>
              <Link to="/privacy" className="text-gray-600 hover:text-green-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-600 hover:text-green-600 transition-colors">Terms</Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
            © {new Date().getFullYear()} Swift Meds. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;