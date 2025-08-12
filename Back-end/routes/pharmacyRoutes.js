/*
import express from 'express';
import PharmacyController from '../controllers/pharmacyController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', PharmacyController.getAllPharmacies);
router.get('/:id', PharmacyController.getPharmacyById);
router.post('/', authMiddleware, PharmacyController.createPharmacy);
router.put('/:id', authMiddleware, PharmacyController.updatePharmacy);
router.delete('/:id', authMiddleware, PharmacyController.deletePharmacy);

export default router;

console.log('getAllPharmacies is function?', 
  typeof PharmacyController.getAllPharmacies === 'function');
  */
 import express from 'express';
import pharmacyController from '../controllers/pharmacyController.js';

const router = express.Router();

// Directly use the exported methods
router.get('/', pharmacyController.getAllPharmacies);
router.get('/:id', pharmacyController.getPharmacyById);

export default router;