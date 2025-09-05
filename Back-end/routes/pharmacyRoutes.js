import express from 'express';
import pharmacyController from '../controllers/pharmacyController.js';

const router = express.Router();

// Directly use the exported methods
//router.get('/', pharmacyController.getAllPharmacies);
//router.get('/:id', pharmacyController.getPharmacyById);

export default router;