// controllers/pharmacyController.js
import { PharmacyDatabaseService } from '../services/pharmacy_database_service.js';

export default {
  // Regular function properties (not class)
  getAllPharmacies: async (req, res) => {
    try {
      const pharmacies = await PharmacyDatabaseService.getPharmacies();
      res.json(pharmacies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPharmacyById: async (req, res) => {
    try {
      const pharmacy = await PharmacyDatabaseService.getPharmacyById(req.params.id);
      res.json(pharmacy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};