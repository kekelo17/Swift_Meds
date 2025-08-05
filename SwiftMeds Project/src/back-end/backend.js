// server.js - Node.js Backend for Pharmacy Dashboard
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database simulation
let reservations = [
  {
    id: 1,
    patientName: 'John Doe',
    patientId: 'P001',
    medication: 'Aspirin 100mg',
    quantity: 30,
    pharmacy: 'City Pharmacy',
    pharmacyId: 1,
    status: 'confirmed',
    date: '2025-08-04',
    time: '14:30',
    createdAt: new Date('2025-08-04T12:00:00Z'),
    updatedAt: new Date('2025-08-04T12:00:00Z'),
    notes: 'Regular prescription refill',
    price: 15.99
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    patientId: 'P002',
    medication: 'Ibuprofen 200mg',
    quantity: 20,
    pharmacy: 'HealthCare Plus',
    pharmacyId: 2,
    status: 'pending',
    date: '2025-08-04',
    time: '16:00',
    createdAt: new Date('2025-08-04T13:30:00Z'),
    updatedAt: new Date('2025-08-04T13:30:00Z'),
    notes: 'First-time patient',
    price: 8.50
  },
  {
    id: 3,
    patientName: 'Mike Johnson',
    patientId: 'P003',
    medication: 'Paracetamol 500mg',
    quantity: 50,
    pharmacy: 'MediCenter',
    pharmacyId: 3,
    status: 'cancelled',
    date: '2025-08-03',
    time: '10:15',
    createdAt: new Date('2025-08-03T08:00:00Z'),
    updatedAt: new Date('2025-08-03T11:00:00Z'),
    notes: 'Patient cancelled due to insurance issues',
    price: 12.75
  }
];

let pharmacies = [
  {
    id: 1,
    name: 'City Pharmacy',
    address: '123 Main St, Downtown',
    phone: '+1-555-0123',
    email: 'info@citypharmacy.com',
    status: 'open',
    rating: 4.5,
    distance: '0.5 km',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    openingHours: {
      monday: '08:00-20:00',
      tuesday: '08:00-20:00',
      wednesday: '08:00-20:00',
      thursday: '08:00-20:00',
      friday: '08:00-20:00',
      saturday: '09:00-18:00',
      sunday: '10:00-16:00'
    },
    services: ['prescription', 'otc', 'consultation', 'delivery'],
    totalReservations: 145,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-08-04')
  },
  {
    id: 2,
    name: 'HealthCare Plus',
    address: '456 Oak Ave, Midtown',
    phone: '+1-555-0456',
    email: 'contact@healthcareplus.com',
    status: 'open',
    rating: 4.2,
    distance: '1.2 km',
    coordinates: { lat: 40.7580, lng: -73.9855 },
    openingHours: {
      monday: '07:30-21:00',
      tuesday: '07:30-21:00',
      wednesday: '07:30-21:00',
      thursday: '07:30-21:00',
      friday: '07:30-21:00',
      saturday: '08:00-19:00',
      sunday: '09:00-17:00'
    },
    services: ['prescription', 'otc', 'supplements', 'health-screening'],
    totalReservations: 198,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2025-08-04')
  },
  {
    id: 3,
    name: 'MediCenter',
    address: '789 Pine Rd, Uptown',
    phone: '+1-555-0789',
    email: 'help@medicenter.com',
    status: 'closed',
    rating: 4.8,
    distance: '2.1 km',
    coordinates: { lat: 40.7831, lng: -73.9712 },
    openingHours: {
      monday: '09:00-18:00',
      tuesday: '09:00-18:00',
      wednesday: '09:00-18:00',
      thursday: '09:00-18:00',
      friday: '09:00-18:00',
      saturday: '10:00-15:00',
      sunday: 'closed'
    },
    services: ['prescription', 'specialty-medications', 'consultation'],
    totalReservations: 267,
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2025-08-04')
  }
];

let medications = [
  {
    id: 1,
    name: 'Aspirin',
    dosage: '100mg',
    category: 'otc',
    description: 'Pain relief and anti-inflammatory',
    price: 5.99,
    inStock: true,
    availablePharmacies: [1, 2, 3]
  },
  {
    id: 2,
    name: 'Ibuprofen',
    dosage: '200mg',
    category: 'otc',
    description: 'Non-steroidal anti-inflammatory drug',
    price: 3.49,
    inStock: true,
    availablePharmacies: [1, 2]
  },
  {
    id: 3,
    name: 'Paracetamol',
    dosage: '500mg',
    category: 'otc',
    description: 'Pain relief and fever reducer',
    price: 4.25,
    inStock: true,
    availablePharmacies: [2, 3]
  },
  {
    id: 4,
    name: 'Amoxicillin',
    dosage: '250mg',
    category: 'prescription',
    description: 'Antibiotic for bacterial infections',
    price: 12.99,
    inStock: true,
    availablePharmacies: [1, 3]
  }
];

let nextReservationId = 4;
let nextPharmacyId = 4;
let nextMedicationId = 5;

// Routes

// Dashboard Statistics
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const todayReservations = reservations.filter(r => r.date === today);
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
    const pendingReservations = reservations.filter(r => r.status === 'pending');
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled');
    
    const openPharmacies = pharmacies.filter(p => p.status === 'open');
    
    const recentActivity = reservations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        type: 'reservation',
        description: `${r.patientName} reserved ${r.medication}`,
        timestamp: r.createdAt,
        status: r.status
      }));

    res.json({
      todayReservations: todayReservations.length,
      totalReservations: reservations.length,
      confirmedReservations: confirmedReservations.length,
      pendingReservations: pendingReservations.length,
      cancelledReservations: cancelledReservations.length,
      totalPharmacies: pharmacies.length,
      openPharmacies: openPharmacies.length,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reservations CRUD Operations
app.get('/api/reservations', (req, res) => {
  try {
    const { search, status, pharmacy, date, page = 1, limit = 10 } = req.query;
    
    let filteredReservations = [...reservations];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReservations = filteredReservations.filter(r => 
        r.patientName.toLowerCase().includes(searchLower) ||
        r.medication.toLowerCase().includes(searchLower) ||
        r.pharmacy.toLowerCase().includes(searchLower)
      );
    }
    
    if (status) {
      filteredReservations = filteredReservations.filter(r => r.status === status);
    }
    
    if (pharmacy) {
      filteredReservations = filteredReservations.filter(r => r.pharmacy === pharmacy);
    }
    
    if (date) {
      filteredReservations = filteredReservations.filter(r => r.date === date);
    }
    
    // Sort by creation date (newest first)
    filteredReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedReservations = filteredReservations.slice(startIndex, endIndex);
    
    res.json({
      reservations: paginatedReservations,
      totalReservations: filteredReservations.length,
      totalPages: Math.ceil(filteredReservations.length / limit),
      currentPage: parseInt(page),
      hasNextPage: endIndex < filteredReservations.length,
      hasPrevPage: startIndex > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/reservations/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = reservations.find(r => r.id === id);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reservations', (req, res) => {
  try {
    const { patientName, patientId, medication, quantity, pharmacy, pharmacyId, date, time, notes } = req.body;
    
    if (!patientName || !medication || !quantity || !pharmacy) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientName, medication, quantity, pharmacy' 
      });
    }
    
    const newReservation = {
      id: nextReservationId++,
      patientName,
      patientId: patientId || `P${String(nextReservationId).padStart(3, '0')}`,
      medication,
      quantity: parseInt(quantity),
      pharmacy,
      pharmacyId: pharmacyId || 1,
      status: 'pending',
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: notes || '',
      price: Math.round((Math.random() * 20 + 5) * 100) / 100 // Random price for demo
    };
    
    reservations.push(newReservation);
    
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/reservations/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const reservationIndex = reservations.findIndex(r => r.id === id);
    
    if (reservationIndex === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    const updatedReservation = {
      ...reservations[reservationIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    reservations[reservationIndex] = updatedReservation;
    
    res.json(updatedReservation);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/reservations/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reservationIndex = reservations.findIndex(r => r.id === id);
    
    if (reservationIndex === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    const deletedReservation = reservations.splice(reservationIndex, 1)[0];
    
    res.json({ message: 'Reservation deleted successfully', reservation: deletedReservation });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pharmacies CRUD Operations
app.get('/api/pharmacies', (req, res) => {
  try {
    const { search, status, distance, page = 1, limit = 10 } = req.query;
    
    let filteredPharmacies = [...pharmacies];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPharmacies = filteredPharmacies.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower)
      );
    }
    
    if (status) {
      filteredPharmacies = filteredPharmacies.filter(p => p.status === status);
    }
    
    if (distance) {
      const maxDistance = parseFloat(distance.replace('km', ''));
      filteredPharmacies = filteredPharmacies.filter(p => 
        parseFloat(p.distance.replace(' km', '')) <= maxDistance
      );
    }
    
    // Sort by rating (highest first)
    filteredPharmacies.sort((a, b) => b.rating - a.rating);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPharmacies = filteredPharmacies.slice(startIndex, endIndex);
    
    res.json({
      pharmacies: paginatedPharmacies,
      totalPharmacies: filteredPharmacies.length,
      totalPages: Math.ceil(filteredPharmacies.length / limit),
      currentPage: parseInt(page),
      hasNextPage: endIndex < filteredPharmacies.length,
      hasPrevPage: startIndex > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/pharmacies/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pharmacy = pharmacies.find(p => p.id === id);
    
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }
    
    // Get reservations for this pharmacy
    const pharmacyReservations = reservations.filter(r => r.pharmacyId === id);
    
    res.json({
      ...pharmacy,
      reservations: pharmacyReservations,
      totalReservations: pharmacyReservations.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/pharmacies', (req, res) => {
  try {
    const { name, address, phone, email, openingHours, services } = req.body;
    
    if (!name || !address || !phone) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, address, phone' 
      });
    }
    
    const newPharmacy = {
      id: nextPharmacyId++,
      name,
      address,
      phone,
      email: email || '',
      status: 'open',
      rating: 0,
      distance: '0 km', // Would be calculated based on user location
      coordinates: { lat: 0, lng: 0 }, // Would be geocoded
      openingHours: openingHours || {},
      services: services || ['prescription'],
      totalReservations: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    pharmacies.push(newPharmacy);
    
    res.status(201).json(newPharmacy);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Medications Search and Management
app.get('/api/medications', (req, res) => {
  try {
    const { search, category, inStock, pharmacy, page = 1, limit = 10 } = req.query;
    
    let filteredMedications = [...medications];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMedications = filteredMedications.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (category) {
      filteredMedications = filteredMedications.filter(m => m.category === category);
    }
    
    if (inStock === 'true') {
      filteredMedications = filteredMedications.filter(m => m.inStock);
    }
    
    if (pharmacy) {
      const pharmacyId = parseInt(pharmacy);
      filteredMedications = filteredMedications.filter(m => 
        m.availablePharmacies.includes(pharmacyId)
      );
    }
    
    // Sort by name
    filteredMedications.sort((a, b) => a.name.localeCompare(b.name));
    
    // Add pharmacy information
    const medicationsWithPharmacies = filteredMedications.map(med => ({
      ...med,
      pharmacies: med.availablePharmacies.map(pid => 
        pharmacies.find(p => p.id === pid)
      ).filter(Boolean)
    }));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMedications = medicationsWithPharmacies.slice(startIndex, endIndex);
    
    res.json({
      medications: paginatedMedications,
      totalMedications: filteredMedications.length,
      totalPages: Math.ceil(filteredMedications.length / limit),
      currentPage: parseInt(page),
      hasNextPage: endIndex < filteredMedications.length,
      hasPrevPage: startIndex > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search endpoint for combined search across medications and pharmacies
app.get('/api/search', (req, res) => {
  try {
    const { q, type = 'all', location, category } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchLower = q.toLowerCase();
    let results = { medications: [], pharmacies: [] };
    
    if (type === 'all' || type === 'medications') {
      results.medications = medications.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower)
      ).map(med => ({
        ...med,
        type: 'medication',
        pharmacies: med.availablePharmacies.map(pid => 
          pharmacies.find(p => p.id === pid)
        ).filter(Boolean)
      }));
    }
    
    if (type === 'all' || type === 'pharmacies') {
      results.pharmacies = pharmacies.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower)
      ).map(pharmacy => ({
        ...pharmacy,
        type: 'pharmacy'
      }));
    }
    
    res.json({
      query: q,
      results,
      totalResults: results.medications.length + results.pharmacies.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk operations for reservations
app.post('/api/reservations/bulk', (req, res) => {
  try {
    const { action, reservationIds, updateData } = req.body;
    
    if (!action || !reservationIds || !Array.isArray(reservationIds)) {
      return res.status(400).json({ error: 'Invalid bulk operation data' });
    }
    
    const affectedReservations = [];
    
    switch (action) {
      case 'delete':
        reservationIds.forEach(id => {
          const index = reservations.findIndex(r => r.id === parseInt(id));
          if (index !== -1) {
            affectedReservations.push(reservations.splice(index, 1)[0]);
          }
        });
        break;
        
      case 'update':
        if (!updateData) {
          return res.status(400).json({ error: 'Update data required for bulk update' });
        }
        
        reservationIds.forEach(id => {
          const index = reservations.findIndex(r => r.id === parseInt(id));
          if (index !== -1) {
            reservations[index] = {
              ...reservations[index],
              ...updateData,
              updatedAt: new Date()
            };
            affectedReservations.push(reservations[index]);
          }
        });
        break;
        
      case 'confirm':
        reservationIds.forEach(id => {
          const index = reservations.findIndex(r => r.id === parseInt(id));
          if (index !== -1) {
            reservations[index] = {
              ...reservations[index],
              status: 'confirmed',
              updatedAt: new Date()
            };
            affectedReservations.push(reservations[index]);
          }
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid bulk action' });
    }
    
    res.json({
      message: `Bulk ${action} completed`,
      affectedCount: affectedReservations.length,
      reservations: affectedReservations
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics endpoints
app.get('/api/analytics/reservations', (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const periodReservations = reservations.filter(r => 
      new Date(r.createdAt) >= startDate
    );
    
    // Group by status
    const statusCounts = periodReservations.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    
    // Group by pharmacy
    const pharmacyCounts = periodReservations.reduce((acc, r) => {
      acc[r.pharmacy] = (acc[r.pharmacy] || 0) + 1;
      return acc;
    }, {});
    
    // Daily breakdown
    const dailyBreakdown = {};
    periodReservations.forEach(r => {
      const date = r.date;
      dailyBreakdown[date] = (dailyBreakdown[date] || 0) + 1;
    });
    
    res.json({
      period,
      totalReservations: periodReservations.length,
      statusBreakdown: statusCounts,
      pharmacyBreakdown: pharmacyCounts,
      dailyBreakdown,
      averagePerDay: Math.round(periodReservations.length / (period === '24h' ? 1 : parseInt(period)))
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'PharmaDash API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'PharmaDash API Documentation',
    version: '1.0.0',
    baseUrl: `http://localhost:${PORT}/api`,
    endpoints: {
      dashboard: {
        'GET /dashboard/stats': 'Get dashboard statistics'
      },
      reservations: {
        'GET /reservations': 'List reservations with filtering and pagination',
        'POST /reservations': 'Create new reservation',
        'GET /reservations/:id': 'Get reservation by ID',
        'PUT /reservations/:id': 'Update reservation',
        'DELETE /reservations/:id': 'Delete reservation',
        'POST /reservations/bulk': 'Bulk operations on reservations'
      },
      pharmacies: {
        'GET /pharmacies': 'List pharmacies with filtering',
        'POST /pharmacies': 'Create new pharmacy',
        'GET /pharmacies/:id': 'Get pharmacy details with reservations'
      },
      medications: {
        'GET /medications': 'Search medications with pharmacy availability'
      },
      search: {
        'GET /search': 'Combined search across medications and pharmacies'
      },
      analytics: {
        'GET /analytics/reservations': 'Reservation analytics with time periods'
      },
      system: {
        'GET /health': 'Health check',
        'GET /docs': 'API documentation'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableEndpoints: '/api/docs'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PharmaDash API server running on port ${PORT}`);
  console.log(`📊 Dashboard stats: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🏥 Pharmacies: http://localhost:${PORT}/api/pharmacies`);
  console.log(`💊 Medications: http://localhost:${PORT}/api/medications`);
  console.log(`📋 Reservations: http://localhost:${PORT}/api/reservations`);
  console.log(`🔍 Search: http://localhost:${PORT}/api/search`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;