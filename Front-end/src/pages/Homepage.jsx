
import React, { useState, useEffect } from 'react';

const Homepage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-sans antialiased text-gray-900 bg-white overflow-x-hidden">

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-20">
            <a href="#" className="flex items-center gap-3 text-gray-900 font-semibold no-underline">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xl">
                <i className="fas fa-pills"></i>
              </div>
              <span className="text-3xl font-bold">SwiftMeds</span>
            </a>
            <ul className="hidden md:flex list-none gap-6">
              <li><a href="#home" className="text-gray-600 font-medium hover:text-green-500 transition-colors no-underline py-2">Home</a></li>
              <li><a href="#about" className="text-gray-600 font-medium hover:text-green-500 transition-colors no-underline py-2">About</a></li>
              <li><a href="#services" className="text-gray-600 font-medium hover:text-green-500 transition-colors no-underline py-2">Services</a></li>
              <li><a href="#contact" className="text-gray-600 font-medium hover:text-green-500 transition-colors no-underline py-2">Contact</a></li>
            </ul>
            <div className="flex items-center">
              <a href="/auth/signin" className="bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-green-50 hover:text-green-600 border border-gray-200 transition-all duration-200 no-underline">
                Sign In
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-32 pb-20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                The Future of Healthcare
                <span className="block text-green-600">with SwiftMeds Technology</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Expert tech to elevate your medication management. Let's take your health further.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/auth/signup" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 no-underline">
                  Get Started
                </a>
                <a href="#demo" className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold border border-green-600 hover:bg-green-50 transition-all duration-200 no-underline">
                  Try Demo
                </a>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-2">
                <div className="flex text-yellow-500">
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                  <span className="ml-2 text-gray-900 font-medium">4.8</span>
                </div>
                <p className="text-gray-600 ml-2">5K+ reviews</p>
              </div>
            </div>
            <div className="relative h-96 lg:h-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-md space-y-4">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex justify-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
                    <div className="text-2xl font-bold">100+</div>
                    <div className="text-right">
                      <span className="block">Pharmacies</span>
                      <span className="block">Connected</span>
                    </div>
                    <div className="text-white">
                      <i className="fas fa-arrow-up"></i>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
                    <div className="text-2xl font-bold">1951+</div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-calendar text-green-500"></i>
                      <span>Appointments</span>
                    </div>
                  </div>
                </div>
              </div>
              <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
                <path d="M0,100 Q200,50 400,100" stroke="#10b981" strokeWidth="2" fill="none" />
                <path d="M100,150 Q200,100 300,150" stroke="#10b981" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">From Idea to Production in Days</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Contact us today to discover how our technology can transform your healthcare delivery.
          </p>
          <a href="#contact" className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all duration-200 no-underline">
            Work With Us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xl">
                  <i className="fas fa-pills"></i>
                </div>
                <span className="text-3xl font-bold">SwiftMeds</span>
              </div>
              <p className="text-gray-400">
                Our automated cloud distribution platform allows brands and retailers to accelerate their digital transformation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">Leadership</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">News</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Industries</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">Precision Manufacturing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">Food and Beverage</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">Automotive</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">Aerospace</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">Manufacturing Execution Systems</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">SCADA Solutions</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">Quality Management</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white no-underline">Supply Chain Planning</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get In Touch</h4>
              <p className="text-gray-400 mb-4">
                Near Lycée Anguisa, Yaoundé<br />Cameroon
              </p>
              <p className="text-gray-400 mb-4">All Days - 10am to 6pm</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white text-xl"><i className="fab fa-linkedin"></i></a>
                <a href="#" className="text-gray-400 hover:text-white text-xl"><i className="fab fa-twitter"></i></a>
                <a href="#" className="text-gray-400 hover:text-white text-xl"><i className="fab fa-facebook"></i></a>
                <a href="#" className="text-gray-400 hover:text-white text-xl"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">&copy; 2024 SwiftMeds. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm no-underline">Terms & Conditions</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm no-underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
