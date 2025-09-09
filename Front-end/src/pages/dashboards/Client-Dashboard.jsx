import React, { useState, useEffect } from 'react';
import { PharmacyDatabaseService } from '../../../../Back-end/services/pharmacy_database_service.js';
import { usePharmacyAuth } from '../../../../Back-end/hooks/usePharmacyAuth.js';
import Sidebar from './Shared/Sidebar';
import Navbar from './Shared/Navbar';
import StatusBadge from './Shared/StatusBadge';
import ReservationForm from './Shared/ReservationForm';
import PharmacyMap from '../../components/PharmacyMap';
import * as icons from 'lucide-react';

const ClientDashboard = () => {
  const { user, profile, signOut } = usePharmacyAuth();
  const [activeSection, setActiveSection] = useState('Search');
  const [reservations, setReservations] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 500, max: 10000 });
  const [distanceRange, setDistanceRange] = useState(10); // Default 10km diameter
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  // New states for rating functionality
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedPharmacyForReviews, setSelectedPharmacyForReviews] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPharmacyForRating, setSelectedPharmacyForRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadData();
    loadCategories();
    getUserLocation();
  }, [activeSection, user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reservationsData, pharmaciesData, categoriesData] = await Promise.all([
        PharmacyDatabaseService.getReservations(user?.id),
        PharmacyDatabaseService.getPharmacies(),
        PharmacyDatabaseService.getCategories()
      ]);
      
      setReservations(reservationsData || []);
      setPharmacies(pharmaciesData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await PharmacyDatabaseService.getCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const filters = {
        searchTerm,
        userLocation,
        distance: distanceRange / 2, // Convert diameter to radius
        category: selectedCategory,
        priceRange
      };
      
      const results = await PharmacyDatabaseService.searchMedicationsAndPharmacies(filters);
      setSearchResults(results.filter(r => r.type === 'medication') || []);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleCreateReservation = async (data) => {
    try {
      // Assuming the form data needs mapping; medication name to ID would require additional logic/search
      // For now, pass as-is; enhance service/form as needed
      await PharmacyDatabaseService.createReservation({
        ...data,
        pharmacy_id: profile.pharmacy_id,
        // Add client_id if available, or handle in service
      });
      loadData();
      setShowNewReservationModal(false);
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  const handleReserveClick = (medication) => {
    setSelectedMedication({
      medication: medication.name,
      pharmacy: medication.pharmacy,
      patientName: profile?.full_name || '',
      quantity: 1,
      status: 'pending'
    });
    setEditingReservation(null);
    setShowReservationForm(true);
  };

  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setSelectedMedication(reservation);
    setShowReservationForm(true);
  };

  const handleFormCancel = () => {
    setShowReservationForm(false);
    setSelectedMedication(null);
    setEditingReservation(null);
  };

  // New handler for submitting rating
  const handleSubmitRating = async () => {
    if (rating < 1) {
      alert('Please select a rating');
      return;
    }
    try {
      await PharmacyDatabaseService.createReview(user?.user_id, selectedPharmacyForRating.pharmacy_id, rating, comment);
      loadData(); // Refresh pharmacies to update average_rating
      setShowRatingModal(false);
      setRating(0);
      setComment('');
      setSelectedPharmacyForRating(null);
      alert('Thank you for your rating!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };

  const handleViewReviews = async (pharmacy) => {
    setReviewsLoading(true);
    setReviewsError(null);
    setSelectedPharmacyForReviews(pharmacy);
    try {
      const reviewsData = await PharmacyDatabaseService.getReviewsForPharmacy(pharmacy.pharmacy_id);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviewsError(error.message || 'Failed to load reviews');
    } finally {
      setReviewsLoading(false);
      setShowReviewsModal(true);
    }
  };

  const renderSearch = () => (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Search Medications</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="relative">
            <icons.Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for medications..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.category_id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="space-y-2">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
              <input
                type="number"
                value={distanceRange}
                onChange={(e) => setDistanceRange(parseInt(e.target.value) || 10)}
                placeholder="Max Distance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center">
        <PharmacyMap 
          pharmacies={pharmacies} 
          userLocation={userLocation} 
          onPharmacyClick={setSelectedPharmacy}
        />
      </div>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((medication) => (
            <div key={medication.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{medication.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{medication.genericName}</p>
              <p className="text-xl font-bold text-green-600 mb-3">{medication.price}FCFA</p>
              <p className="text-sm text-gray-500 mb-4">Available at: {medication.pharmacy.name}</p>
              
              <div className="flex space-x-2 mb-4">
                <StatusBadge status="available" size="sm" />
                <StatusBadge status={medication.stock > 0 ? 'available' : 'low'} size="sm" />
              </div>

              <button 
                onClick={() => handleReserveClick(medication)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Reserve Now
              </button>
            </div>
          ))}
        </div>
      )}

      {searchResults.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <icons.Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
          <p className="text-gray-500">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );

  const renderMyReservations = () => (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
      <button
        onClick={() => setShowNewReservationModal(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        New Reservation
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Reservations List</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{reservation.medication}</p>
                  <p className="text-sm text-gray-600">{reservation.pharmacy} - Qty: {reservation.quantity}</p>
                  <p className="text-xs text-gray-500 mt-1">Total:{reservation.totalAmount}FCFA</p>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <StatusBadge status={reservation.status} size="sm" />

                  <button
                    onClick={() => handleEditReservation(reservation)}
                    className="text-green-600 hover:text-green-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleFormCancel(reservation)}
                    className="text-green-600 hover:text-green-900 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {reservations.length === 0 && (
        <div className="text-center py-12">
          <icons.Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations yet</h3>
          <p className="text-gray-500">Start searching for medications to make your first reservation.</p>
        </div>
      )}
    </div>
  );

  const renderPharmaciesList = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Partner Pharmacies</h1>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pharmacies.filter(p => p.status === 'approved').map((pharmacy) => (
          <div key={pharmacy.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{pharmacy.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{pharmacy.address}</p>
                <p className="text-sm text-gray-500">{pharmacy.phone}</p>
              </div>
              <StatusBadge status="open" size="sm" />
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>Hours: {pharmacy.operating_hours}</p>
              <p>Rating: {pharmacy.rating || 0}/5</p>
            </div>
  
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setSelectedPharmacyForRating(pharmacy);
                  setShowRatingModal(true);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                Rate Pharmacy
              </button>
              <button 
                onClick={() => handleViewReviews(pharmacy)}
                className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                View Reviews
              </button>
            </div>
          </div>
        ))}
      </div>
  
      {pharmacies.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <icons.Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
          <p className="text-gray-500">Enable location services to find nearby pharmacies.</p>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profile?.fullName || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                readOnly
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Email Notifications</label>
              <p className="text-sm text-gray-500">Receive updates about your reservations</p>
            </div>
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Location Services</label>
              <p className="text-sm text-gray-500">Allow location access for nearby pharmacies</p>
            </div>
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300" />
          </div>
        </div>

        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors mt-6">
          Update Profile
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <icons.Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      );
    }

    switch (activeSection) {
      case 'Search': return renderSearch();
      case 'My Reservations': return renderMyReservations();
      case 'Pharmacies': return renderPharmaciesList();
      case 'Profile': return renderProfile();
      default: return renderSearch();
    }
  };

  // New Reservation Modal
  const renderNewReservationModal = () => (
    showNewReservationModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <ReservationForm
            selectedItem={null}
            onSubmit={handleCreateReservation}
            onCancel={() => setShowNewReservationModal(false)}
            //pharmacies={[{ pharmacy_id: profile.pharmacy_id, name: profile.pharmacy_name || 'Current Pharmacy' }]}
            //isAdmin={true}
          />
        </div>
      </div>
    )
  );

  // New Rating Modal
  const renderRatingModal = () => (
    showRatingModal && selectedPharmacyForRating && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rate {selectedPharmacyForRating.name}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5 Stars)</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value={0}>Select a rating</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Share your experience with this pharmacy..."
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSubmitRating}
                disabled={rating < 1}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Submit Rating
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRating(0);
                  setComment('');
                  setSelectedPharmacyForRating(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const renderReviewsModal = () => (
    showReviewsModal && selectedPharmacyForReviews && (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Reviews for {selectedPharmacyForReviews.name}</h3>
            <button
              onClick={() => {
                setShowReviewsModal(false);
                setReviews([]);
                setReviewsError(null);
                setSelectedPharmacyForReviews(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <icons.X className="h-5 w-5" />
            </button>
          </div>
          {reviewsLoading && (
            <div className="flex items-center justify-center py-6">
              <icons.Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          )}
          {reviewsError && (
            <div className="text-center py-6">
              <p className="text-red-600">{reviewsError}</p>
            </div>
          )}
          {!reviewsLoading && !reviewsError && reviews.length === 0 && (
            <div className="text-center py-6">
              <icons.MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Be the first to review this pharmacy!</p>
            </div>
          )}
          {!reviewsLoading && !reviewsError && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">{review.clientName}</p>
                    <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <icons.Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{review.comment || 'No comment provided'}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6">
            <button
              onClick={() => {
                setShowReviewsModal(false);
                setReviews([]);
                setReviewsError(null);
                setSelectedPharmacyForReviews(null);
              }}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="client-dashboard min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar user={user} profile={profile} signOut={signOut} />
      <div className="flex">
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700">
          <Sidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            items={[
              { name: 'Search', icon: 'Search' },
              { name: 'My Reservations', icon: 'Calendar' },
              { name: 'Pharmacies', icon: 'Building2' },
              { name: 'Profile', icon: 'User' }
            ]}
          />
        </div>
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
      {renderNewReservationModal()}
      {renderRatingModal()}
      {renderReviewsModal()}
    </div>
  );
};

export default ClientDashboard;