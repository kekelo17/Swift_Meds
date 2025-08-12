import { PharmacyAuthService } from '../services/pharmacy_auth_service.js';

class AuthController {
  static async signUp(req, res, next) {
    try {
      const { email, password, fullName, role } = req.body;
      const result = await PharmacyAuthService.signUp(email, password, { fullName, role });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async signIn(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await PharmacyAuthService.signIn(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }



  // ... other auth methods
}

export default AuthController;