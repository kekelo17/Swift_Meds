import React, { useState, useEffect, useRef } from 'react';
import './CSS/dashboard.css';
import { 
  Search, 
  User, 
  Settings, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Home,
  MapPin,
  Calendar,
  Building2,
  TrendingUp,
  Users,
  Package,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  LogOut,
  BarChart3,
  Map
} from 'lucide-react';

const PharmacyDashboard = () => {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [reservations, setReservations] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [mapView, setMapView] = useState('list'); // 'list' or 'map'
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    medication: '',
    quantity: '',
    pharmacy: '',
    status: 'pending'
  });

  // Simulate API data
  useEffect(() => {
    setReservations([
      { 
        id: 1, 
        patientName: 'John Doe', 
        medication: 'Aspirin 100mg', 
        quantity: 30, 
        pharmacy: 'City Pharmacy', 
        status: 'confirmed',
        date: '2025-08-04',
        time: '14:30',
        coordinates: [-74.0060, 40.7128]
      },
      { 
        id: 2, 
        patientName: 'Jane Smith', 
        medication: 'Ibuprofen 200mg', 
        quantity: 20, 
        pharmacy: 'HealthCare Plus', 
        status: 'pending',
        date: '2025-08-04',
        time: '16:00',
        coordinates: [-73.9855, 40.7580]
      },
      { 
        id: 3, 
        patientName: 'Mike Johnson', 
        medication: 'Paracetamol 500mg', 
        quantity: 50, 
        pharmacy: 'MediCenter', 
        status: 'cancelled',
        date: '2025-08-03',
        time: '10:15',
        coordinates: [-73.9712, 40.7831]
      },
    ]);

    setPharmacies([
      { 
        id: 1, 
        name: 'City Pharmacy', 
        address: '123 Main St, Downtown', 
        phone: '+1-555-0123', 
        status: 'open',
        rating: 4.5,
        distance: '0.5 km',
        coordinates: [-74.0060, 40.7128]
      },
      { 
        id: 2, 
        name: 'HealthCare Plus', 
        address: '456 Oak Ave, Midtown', 
        phone: '+1-555-0456', 
        status: 'open',
        rating: 4.2,
        distance: '1.2 km',
        coordinates: [-73.9855, 40.7580]
      },
      { 
        id: 3, 
        name: 'MediCenter', 
        address: '789 Pine Rd, Uptown', 
        phone: '+1-555-0789', 
        status: 'closed',
        rating: 4.8,
        distance: '2.1 km',
        coordinates: [-73.9712, 40.7831]
      },
    ]);
  }, []);

  // Initialize MapBox map
  useEffect(() => {
    if (activeSection === 'Search' && mapView === 'map' && mapContainer.current && !map.current) {
      // Using a simulated MapBox-like implementation since we can't load external MapBox
      // In a real implementation, you would use: mapboxgl.Map()
      initializeMap();
    }
  }, [activeSection, mapView]);

  const initializeMap = () => {
    // Simulated map initialization
    // In real implementation: map.current = new mapboxgl.Map({...})
    if (mapContainer.current) {
      mapContainer.current.innerHTML = `
        <div class="map-container">
          <div class="map-label">MapBox View - Pharmacies Near You</div>
          ${pharmacies.map((pharmacy, index) => `
            <div class="map-marker ${pharmacy.status === 'open' ? 'open' : 'closed'}" 
                 onclick="alert('${pharmacy.name}\\n${pharmacy.address}\\nStatus: ${pharmacy.status}\\nRating: ${pharmacy.rating}⭐')">
              📍 ${pharmacy.name}
            </div>
          `).join('')}
          <div class="map-info">Click markers for details</div>
        </div>
      `;
    }
  };

  const handleFormSubmit = () => {
    if (activeSection === 'Reserve') {
      if (selectedItem) {
        setReservations(reservations.map(item => 
          item.id === selectedItem.id 
            ? { ...item, patientName: formData.name, medication: formData.medication, quantity: parseInt(formData.quantity), pharmacy: formData.pharmacy, status: formData.status }
            : item
        ));
      } else {
        const newReservation = {
          id: Date.now(),
          patientName: formData.name,
          medication: formData.medication,
          quantity: parseInt(formData.quantity),
          pharmacy: formData.pharmacy,
          status: formData.status,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          coordinates: [-74.0060, 40.7128] // Default coordinates
        };
        setReservations([...reservations, newReservation]);
      }
    }
    setFormData({ name: '', medication: '', quantity: '', pharmacy: '', status: 'pending' });
    setSelectedItem(null);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    if (activeSection === 'Reserve') {
      setFormData({
        name: item.patientName,
        medication: item.medication,
        quantity: item.quantity.toString(),
        pharmacy: item.pharmacy,
        status: item.status
      });
    }
  };

  const handleDelete = (id) => {
    if (activeSection === 'Reserve') {
      setReservations(reservations.filter(item => item.id !== id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      open: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      closed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  const renderQuickStatsModal = () => {
    if (!showQuickStats) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Quick Stats
            </div>
            <button
              onClick={() => setShowQuickStats(false)}
              className="modal-close"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          <div className="modal-body">
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  Total Reservations:
                </span>
                <span className="font-semibold text-gray-900">{reservations.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Confirmed Today:
                </span>
                <span className="font-semibold text-green-600">
                  {reservations.filter(r => r.status === 'confirmed').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  Pending:
                </span>
                <span className="font-semibold text-yellow-600">
                  {reservations.filter(r => r.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center">
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  Cancelled:
                </span>
                <span className="font-semibold text-red-600">
                  {reservations.filter(r => r.status === 'cancelled').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-teal-500" />
                  Partner Pharmacies:
                </span>
                <span className="font-semibold text-gray-900">{pharmacies.length}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfileDropdown = () => {
    if (!showProfileDropdown) return null;

    return (
      <div className="profile-dropdown">
        <div className="profile-header">
          <p className="text-sm font-medium text-gray-900">John Doe</p>
          <p className="text-xs text-gray-500">john.doe@pharmadash.com</p>
        </div>
        <button
          onClick={() => {
            setShowQuickStats(true);
            setShowProfileDropdown(false);
          }}
          className="profile-item"
        >
          <BarChart3 className="h-4 w-4 mr-3 text-green-600" />
          Quick Stats
        </button>
        <button className="profile-item">
          <Settings className="h-4 w-4 mr-3 text-gray-500" />
          Account Settings
        </button>
        <button className="profile-item">
          <User className="h-4 w-4 mr-3 text-gray-500" />
          Profile
        </button>
        <div className="profile-separator">
          <button className="profile-item logout">
            <LogOut className="h-4 w-4 mr-3 text-red-500" />
            Sign Out
          </button>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-icon bg-green-100">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div className="stats-text">
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-500">Today's Reservations</div>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon bg-emerald-100">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="stats-text">
            <div className="text-2xl font-bold text-gray-900">
              {reservations.filter(r => r.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-500">Confirmed</div>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon bg-yellow-100">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="stats-text">
            <div className="text-2xl font-bold text-gray-900">
              {reservations.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon bg-teal-100">
            <Building2 className="h-6 w-6 text-teal-600" />
          </div>
          <div className="stats-text">
            <div className="text-2xl font-bold text-gray-900">{pharmacies.length}</div>
            <div className="text-sm text-gray-500">Partner Pharmacies</div>
          </div>
        </div>
      </div>
      <div className="activity-card">
        <div className="activity-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="activity-body">
          <div className="space-y-4">
            {reservations.slice(0, 3).map((reservation) => (
              <div key={reservation.id} className="activity-item">
                <div className="flex-shrink-0">
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{reservation.patientName}</span> reserved {reservation.medication}
                  </p>
                  <p className="text-xs text-gray-500">{reservation.date} at {reservation.time}</p>
                </div>
                {getStatusBadge(reservation.status)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="search-content">
      <div className="search-card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Medications & Pharmacies</h3>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for medications, pharmacies, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-4">
            <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">All Categories</option>
              <option value="prescription">Prescription</option>
              <option value="otc">Over-the-Counter</option>
              <option value="supplements">Supplements</option>
            </select>
            <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">Distance</option>
              <option value="1km">Within 1km</option>
              <option value="5km">Within 5km</option>
              <option value="10km">Within 10km</option>
            </select>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMapView('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  mapView === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => {
                  setMapView('map');
                  setTimeout(initializeMap, 100);
                }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  mapView === 'map' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Map className="h-4 w-4 inline mr-1" />
                Map
              </button>
            </div>
          </div>
        </div>
      </div>
      {mapView === 'map' && (
        <div className="map-card">
          <div className="map-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Pharmacy Locations
            </h3>
          </div>
          <div className="map-body">
            <div ref={mapContainer} className="w-full"></div>
          </div>
        </div>
      )}
      {mapView === 'list' && (
        <div className="results-card">
          <div className="results-header">
            <h3 className="text-lg font-medium text-gray-900">Search Results</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="results-item">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">Aspirin 100mg</h4>
                  <p className="text-sm text-gray-500">Available at 3 nearby pharmacies</p>
                  <p className="text-sm text-green-600">Starting from $5.99</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Reserve
                </button>
              </div>
            </div>
            <div className="results-item">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">Ibuprofen 200mg</h4>
                  <p className="text-sm text-gray-500">Available at 5 nearby pharmacies</p>
                  <p className="text-sm text-green-600">Starting from $3.49</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Reserve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReserve = () => {
    const filteredReservations = reservations.filter(item =>
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medication.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="reserve-content">
        <div className="search-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="reservations-card">
          <div className="reservations-header">
            <h3 className="text-lg font-medium text-gray-900">Reservations</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="reservations-item">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{reservation.patientName}</h4>
                      <p className="text-sm text-gray-500">{reservation.medication} - Qty: {reservation.quantity}</p>
                      <p className="text-xs text-gray-400">{reservation.pharmacy} • {reservation.date} at {reservation.time}</p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(reservation)}
                    className="p-1 text-gray-400 hover:text-green-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(reservation.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPharmacies = () => (
    <div className="pharmacies-content">
      <div className="pharmacies-card">
        <div className="pharmacies-header">
          <h3 className="text-lg font-medium text-gray-900">Partner Pharmacies</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="pharmacies-item">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{pharmacy.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {pharmacy.address} • {pharmacy.distance}
                      </p>
                      <p className="text-sm text-gray-500">{pharmacy.phone}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(Math.floor(pharmacy.rating))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">({pharmacy.rating})</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(pharmacy.status)}
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeSection) {
      case 'Dashboard':
        return renderDashboard();
      case 'Search':
        return renderSearch();
      case 'Reserve':
        return renderReserve();
      case 'Pharmacies':
        return renderPharmacies();
      default:
        return renderDashboard();
    }
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Search', icon: Search },
    { name: 'Reserve', icon: Calendar },
    { name: 'Pharmacies', icon: Building2 }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  return (
    <div className="pharmacy-dashboard">
      <header className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="text-xl font-bold text-green-600">SwiftMeds</div>
          </div>
          <div className="navbar-profile">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <span>John Doe</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {renderProfileDropdown()}
          </div>
        </div>
      </header>
      <div className="container">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="sidebar">
              <div className="sidebar-content">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setActiveSection(item.name)}
                        className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                          activeSection === item.name
                            ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <IconComponent className="h-5 w-5 mr-3" />
                        {item.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
          <div className="col-span-6">
            <div className="main-header">
              <h1 className="text-2xl font-bold text-gray-900">{activeSection}</h1>
              <p className="text-gray-600">Manage your pharmaceutical needs efficiently</p>
            </div>
            {renderMainContent()}
          </div>
          <div className="col-span-3">
            {activeSection === 'Reserve' && (
              <div className="form-card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedItem ? 'Edit Reservation' : 'New Reservation'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                    <input
                      type="text"
                      value={formData.medication}
                      onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy</label>
                    <select
                      value={formData.pharmacy}
                      onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Pharmacy</option>
                      {pharmacies.map(pharmacy => (
                        <option key={pharmacy.id} value={pharmacy.name}>{pharmacy.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleFormSubmit}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      {selectedItem ? 'Update' : 'Create'}
                    </button>
                    {selectedItem && (
                      <button
                        onClick={() => {
                          setSelectedItem(null);
                          setFormData({ name: '', medication: '', quantity: '', pharmacy: '', status: 'pending' });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="stats-card mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total Reservations:</span>
                  <span className="font-medium">{reservations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confirmed Today:</span>
                  <span className="font-medium text-green-600">
                    {reservations.filter(r => r.status === 'confirmed' && r.date === '2025-08-04').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-medium text-yellow-600">
                    {reservations.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Partner Pharmacies:</span>
                  <span className="font-medium">{pharmacies.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderQuickStatsModal()}
    </div>
  );
};

export default PharmacyDashboard;