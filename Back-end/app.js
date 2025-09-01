
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/supabase.js';
import authRoutes from './routes/authRoutes.js';
import pharmacyRoutes from './routes/pharmacyRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pharmacies', pharmacyRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});