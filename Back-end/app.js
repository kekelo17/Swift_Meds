import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Debug: Log every route/middleware registration
const originalUse = app.use;
app.use = function(...args) {
  if (typeof args[0] === 'string') {
    console.log('Registering middleware/route for path:', args[0]);
  } else {
    console.log('Registering middleware/route for all paths');
  }
  return originalUse.apply(this, args);
};

const PORT = process.env.PORT || 5000;

// Supabase configuration with validation
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database tables
const TABLES = {
  USERS: 'users',
  CLIENTS: 'clients',
  PHARMACISTS: 'pharmacists',
  ADMINS: 'admins',
  PHARMACIES: 'pharmacies',
  MEDICATIONS: 'medications',
  INVENTORY: 'inventory',
  RESERVATIONS: 'reservations'
};

// Middleware for authentication
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================

// Sign up route - FIXED: Added email handling
app.post('/api/auth/signup', async (req, res) => {
  try {
    const {
      fullName,
      email, // ← ADDED: Email field
      phone,
      dateOfBirth,
      address,
      password,
      role,
      pharmacyName,
      licenseNumber,
      operatingHours
    } = req.body;

    // Validate required fields - FIXED: Added email validation
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        error: 'Full name, email, password, and role are required'
      });
    }

    // Check if user already exists by email - FIXED: Added email check
    const { data: existingUserByEmail } = await supabase
      .from(TABLES.USERS)
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingUserByEmail) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }


    // Check if user exists by email or phone
    const { data: existingUsers, error } = await supabase
      .from(TABLES.USERS)
      .select('user_id, email, phone_number')
      .or(`email.eq.${email},phone_number.eq.${phone}`);
    
    if (error) {
      console.error('Error checking existing users:', error);
      return res.status(500).json({ error: 'Server error during validation' });
    }
    
    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      
      if (existingUser.email === email) {
        return res.status(400).json({
          error: 'User with this email already exists',
          field: 'email'
        });
      }
      
      if (existingUser.phone_number === phone) {
        return res.status(400).json({
          error: 'User with this phone number already exists',
          field: 'phone'
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user - FIXED: Added email field
    const { data: userRecord, error: userError } = await supabase
      .from(TABLES.USERS)
      .insert({
        full_name: fullName,
        email: email, // ← ADDED: Email field
        address: address || null,
        date_of_birth: dateOfBirth || null,
        phone_number: phone || null,
        password_hash: hashedPassword,
        role: role
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(400).json({ error: userError.message });
    }

    // Create role-specific record (existing code remains the same)
    if (role === 'client') {
      const { error: clientError } = await supabase
        .from(TABLES.CLIENTS)
        .insert({
          user_id: userRecord.user_id,
          is_premium: false
        });

      if (clientError) {
        console.error('Client creation error:', clientError);
        return res.status(400).json({ error: clientError.message });
      }
    } else if (role === 'pharmacist') {
      let pharmacyId = null;

      if (pharmacyName) {
        const { data: pharmacyData, error: pharmacyError } = await supabase
          .from(TABLES.PHARMACIES)
          .insert({
            name: pharmacyName,
            address: address,
            contact_info: phone,
            phone: phone,
            operating_hours: operatingHours || 'Mon-Fri: 8AM-6PM',
            is_approved: false,
            status: 'pending'
          })
          .select()
          .single();

        if (pharmacyError) {
          console.error('Pharmacy creation error:', pharmacyError);
          return res.status(400).json({ error: pharmacyError.message });
        }

        pharmacyId = pharmacyData.pharmacy_id;
      }

      const { error: pharmacistError } = await supabase
        .from(TABLES.PHARMACISTS)
        .insert({
          user_id: userRecord.user_id,
          license_number: licenseNumber,
          pharmacy_id: pharmacyId
        });

      if (pharmacistError) {
        console.error('Pharmacist creation error:', pharmacistError);
        return res.status(400).json({ error: pharmacistError.message });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userRecord.user_id, 
        role: userRecord.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: role === 'pharmacist' 
        ? 'Pharmacy account created successfully. Awaiting admin approval.' 
        : 'Account created successfully!',
      user: {
        user_id: userRecord.user_id,
        full_name: userRecord.full_name,
        email: userRecord.email, // ← ADDED: Email in response
        role: userRecord.role,
        phone_number: userRecord.phone_number
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in route - FIXED: Use email instead of phone
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body; // ← CHANGED: identifier → email

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required' // ← CHANGED: message
      });
    }

    // Find user by email - FIXED: Use email instead of phone_number
    const { data: userData, error: userError } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('email', email) // ← CHANGED: phone_number → email
      .single();

    if (userError || !userData) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, userData.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get role-specific data
    let roleData = null;
    
    if (userData.role === 'client') {
      const { data: clientData } = await supabase
        .from(TABLES.CLIENTS)
        .select('*')
        .eq('user_id', userData.user_id)
        .single();
      roleData = clientData;
    } else if (userData.role === 'pharmacist') {
      const { data: pharmacistData } = await supabase
        .from(TABLES.PHARMACISTS)
        .select(`
          *,
          pharmacy:pharmacy_id (
            name,
            address,
            is_approved,
            status
          )
        `)
        .eq('user_id', userData.user_id)
        .single();
      roleData = pharmacistData;
    } else if (userData.role === 'admin') {
      const { data: adminData } = await supabase
        .from(TABLES.ADMINS)
        .select('*')
        .eq('user_id', userData.user_id)
        .single();
      roleData = adminData;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userData.user_id, 
        role: userData.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: {
        user_id: userData.user_id,
        full_name: userData.full_name,
        email: userData.email, // ← ADDED: Email in response
        role: userData.role,
        phone_number: userData.phone_number,
        address: userData.address,
        roleData: roleData
      },
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile - FIXED: Added email to response
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('user_id', req.userId)
      .single();

    if (userError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get role-specific data
    let roleData = null;
    
    if (userData.role === 'client') {
      const { data: clientData } = await supabase
        .from(TABLES.CLIENTS)
        .select('*')
        .eq('user_id', userData.user_id)
        .single();
      roleData = clientData;
    } else if (userData.role === 'pharmacist') {
      const { data: pharmacistData } = await supabase
        .from(TABLES.PHARMACISTS)
        .select(`
          *,
          pharmacy:pharmacy_id (
            name,
            address,
            is_approved,
            status
          )
        `)
        .eq('user_id', userData.user_id)
        .single();
      roleData = pharmacistData;
    }

    res.json({
      success: true,
      user: {
        ...userData, // This now includes email
        roleData: roleData
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== RESERVATION ROUTES ====================

// Get reservations
app.get('/api/reservations', authenticateToken, async (req, res) => {
  try {
    let query = supabase
      .from(TABLES.RESERVATIONS)
      .select(`
        *,
        pharmacy:pharmacy_id (
          pharmacy_id,
          name,
          address,
          phone
        ),
        client:client_id (
          client_id,
          user:user_id (
            full_name
          )
        ),
        medication:medication_id (
          name,
          generic_name,
          price
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by user role
    if (req.userRole === 'client') {
      const { data: clientData } = await supabase
        .from(TABLES.CLIENTS)
        .select('client_id')
        .eq('user_id', req.userId)
        .single();
      
      if (clientData) {
        query = query.eq('client_id', clientData.client_id);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Reservations fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create reservation
app.post('/api/reservations', authenticateToken, async (req, res) => {
  try {
    const {
      pharmacyId,
      medicationId,
      patientName,
      quantity,
      totalAmount
    } = req.body;

    // Get client_id from user_id
    const { data: clientData, error: clientError } = await supabase
      .from(TABLES.CLIENTS)
      .select('client_id')
      .eq('user_id', req.userId)
      .single();

    if (clientError || !clientData) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check inventory
    const { data: inventoryData } = await supabase
      .from(TABLES.INVENTORY)
      .select('quantity')
      .eq('pharmacy_id', pharmacyId)
      .eq('medication_id', medicationId)
      .single();

    if (!inventoryData || inventoryData.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient inventory' });
    }

    const { data, error } = await supabase
      .from(TABLES.RESERVATIONS)
      .insert([{
        client_id: clientData.client_id,
        pharmacy_id: pharmacyId,
        medication_id: medicationId,
        patient_name: patientName,
        quantity: parseInt(quantity),
        status: 'pending',
        total_amount: totalAmount,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PHARMACY ROUTES ====================

// Get pharmacies
app.get('/api/pharmacies', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PHARMACIES)
      .select('*')
      .eq('is_approved', true)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Pharmacies fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== MEDICATION ROUTES ====================

// Get medications
app.get('/api/medications', async (req, res) => {
  try {
    const { search, pharmacy_id, category } = req.query;
    
    let query = supabase
      .from('medication_search_view')
      .select('*');

    if (pharmacy_id) {
      query = query.eq('pharmacy_id', pharmacy_id);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Medications fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});