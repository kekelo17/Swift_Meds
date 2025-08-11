import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import OpenStreetMap from './leaflet';
import './CSS/dashboard.css';
import './CSS/auth.css';
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
import { PharmacyDatabaseService } from '/home/keumoe/Desktop/PHARMAP/Back-end/src/service/pharmacy_database_service.js';
import { PharmacyAuthService, usePharmacyAuth } from '/home/keumoe/Desktop/PHARMAP/Back-end/src/service/pharmacy_auth_service.js';

const navigate = useNavigate();

const PharmacyDashboard = () => {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [reservations, setReservations] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [mapView, setMapView] = useState('list'); // 'list' or 'map'
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    today: 0
  });
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    medication: '',
    quantity: '',
    pharmacy: '',
    status: 'pending'
  });

  // Use auth hook
  const { user, profile, loading, signOut } = usePharmacyAuth();

  // Load data based on active section
  useEffect(() => {
    const loadData = async () => {
      try {
        switch (activeSection) {
          case 'Dashboard':
            const [reservationsData, statsData] = await Promise.all([
              PharmacyDatabaseService.getReservations(user?.id),
              PharmacyDatabaseService.getReservationStats(user?.id)
            ]);
            setReservations(reservationsData);
            setStats(statsData);
            break;
          case 'Reserve':
            const resData = await PharmacyDatabaseService.getReservations(user?.id);
            setReservations(resData);
            break;
          case 'Pharmacies':
            const pharmData = await PharmacyDatabaseService.getPharmacies();
            setPharmacies(pharmData);
            break;
          case 'Search':
            const medData = await PharmacyDatabaseService.getMedications();
            setMedications(medData);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    // Set up real-time subscriptions
    let reservationSubscription;
    let pharmacySubscription;

    if (activeSection === 'Dashboard' || activeSection === 'Reserve') {
      reservationSubscription = PharmacyDatabaseService.subscribeToReservations(
        (payload) => {
          console.log('Realtime reservation update:', payload);
          setReservations(prev => {
            if (payload.eventType === 'DELETE') {
              return prev.filter(r => r.id !== payload.old.id);
            } else if (payload.eventType === 'INSERT') {
              return [payload.new, ...prev];
            } else {
              return prev.map(r => r.id === payload.new.id ? payload.new : r);
            }
          });
        },
        user?.id
      );
    }

    if (activeSection === 'Pharmacies') {
      pharmacySubscription = PharmacyDatabaseService.subscribeToPharmacies(
        (payload) => {
          console.log('Realtime pharmacy update:', payload);
          setPharmacies(prev => {
            if (payload.eventType === 'DELETE') {
              return prev.filter(p => p.id !== payload.old.id);
            } else if (payload.eventType === 'INSERT') {
              return [payload.new, ...prev];
            } else {
              return prev.map(p => p.id === payload.new.id ? payload.new : p);
            }
          });
        }
      );
    }

    return () => {
      if (reservationSubscription) PharmacyDatabaseService.unsubscribe(reservationSubscription);
      if (pharmacySubscription) PharmacyDatabaseService.unsubscribe(pharmacySubscription);
    };
  }, [activeSection, user?.id]);

  // Handle form submission for reservations
  const handleFormSubmit = async () => {
    try {
      if (activeSection === 'Reserve') {
        if (selectedItem) {
          // Update existing reservation
          const updatedReservation = await PharmacyDatabaseService.updateReservation(
            selectedItem.id,
            {
              patientName: formData.name,
              medication: formData.medication,
              quantity: parseInt(formData.quantity),
              pharmacy: formData.pharmacy,
              status: formData.status
            }
          );
          setReservations(reservations.map(item => 
            item.id === selectedItem.id ? updatedReservation : item
          ));
        } else {
          // Create new reservation
          const newReservation = await PharmacyDatabaseService.createReservation(
            {
              patientName: formData.name,
              medication: formData.medication,
              quantity: parseInt(formData.quantity),
              pharmacy: formData.pharmacy,
              status: formData.status
            },
            user.id
          );
          setReservations([newReservation, ...reservations]);
        }
        setFormData({ name: '', medication: '', quantity: '', pharmacy: '', status: 'pending' });
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error handling reservation:', error);
    }
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

  const handleDelete = async (id) => {
    try {
      if (activeSection === 'Reserve') {
        await PharmacyDatabaseService.deleteReservation(id);
        setReservations(reservations.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  const handleSearch = async () => {
    try {
      if (activeSection === 'Search') {
        const results = await PharmacyDatabaseService.searchMedicationsAndPharmacies(searchTerm);
        setMedications(results.medications);
        setPharmacies(results.pharmacies);
      }
    } catch (error) {
      console.error('Error searching:', error);
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
                <span className="font-semibold text-gray-900">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Confirmed Today:
                </span>
                <span className="font-semibold text-green-600">
                  {stats.confirmed}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  Pending:
                </span>
                <span className="font-semibold text-yellow-600">
                  {stats.pending}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center">
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  Cancelled:
                </span>
                <span className="font-semibold text-red-600">
                  {stats.cancelled}
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
          <p className="text-sm font-medium text-gray-900">{profile?.full_name || user?.email}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
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
          <button 
            onClick={signOut}
            className="profile-item logout"
          >
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
            <div className="text-2xl font-bold text-gray-900">{stats.today}</div>
            <div className="text-sm text-gray-500">Today's Reservations</div>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon bg-emerald-100">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="stats-text">
            <div className="text-2xl font-bold text-gray-900">
              {stats.confirmed}
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
              {stats.pending}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
          </div>
        </div>
      </div>

      <div className="map-card">
        <div className="map-header">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-green-600" />
            Pharmacy Locations
          </h3>
        </div>
        <div className="map-body" style={{ height: '500px' }}>
          <OpenStreetMap 
            pharmacies={pharmacies} 
            onMarkerClick={(pharmacy) => {
              alert(`${pharmacy.name}\n${pharmacy.address}\nStatus: ${pharmacy.status}\nRating: ${pharmacy.rating}⭐`);
            }}
          />
        </div>
      </div>

      <div className="results-card mt-6">
        <div className="results-header">
          <h3 className="text-lg font-medium text-gray-900">Search Results</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {medications.slice(0, 5).map((medication) => (
            <div key={medication.id} className="results-item">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{medication.name}</h4>
                  <p className="text-sm text-gray-500">{medication.description}</p>
                  <p className="text-sm text-green-600">${medication.price}</p>
                </div>
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  onClick={() => {
                    setActiveSection('Reserve');
                    setFormData(prev => ({
                      ...prev,
                      medication: medication.name,
                      pharmacy: medication.pharmacy?.name || ''
                    }));
                  }}
                >
                  Reserve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
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
            <button 
              className="text-green-600 text-sm font-medium"
              onClick={() => setActiveSection('Search')}
            >
              <Plus className="h-4 w-4 inline mr-1" />
              New Reservation
            </button>
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
                        {pharmacy.address} • {pharmacy.distance || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">{pharmacy.phone}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(Math.floor(pharmacy.rating || 0))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">({pharmacy.rating || '0'})</span>
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
    if (loading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (!user) {
      return <div className="auth-message">Please sign in to access the dashboard</div>;
    }

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

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="pharmacy-dashboard">
      <header className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="text-xl font-bold text-green-600">SwiftMeds</div>
          </div>
          {user ? (
            <div className="navbar-profile">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <span>{profile?.full_name || user.email}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {renderProfileDropdown()}
            </div>
          ) : (
            <button
              onClick={() => navigate("/signup")}
              className="text-green-600 hover:text-green-800"
            >
              Sign Up
            </button>
          )}
        </div>
      </header>
      {user ? (
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
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confirmed Today:</span>
                    <span className="font-medium text-green-600">
                      {stats.confirmed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-medium text-yellow-600">
                      {stats.pending}
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
      ) : (
        <div className="auth-container">
          <div className="auth-card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to SwiftMeds</h2>
            <p className="text-gray-600 mb-8">Please sign in to access your SwiftMeds dashboard</p>
            <button
              onClick={() => navigate("/signin")}
              className="w-full bg-green-600 text-green-600 py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
      {renderQuickStatsModal()}
    </div>
  );
};

export default PharmacyDashboard;