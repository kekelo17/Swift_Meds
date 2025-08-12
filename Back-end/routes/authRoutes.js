import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);
/*router.post('/signout', AuthController.signOut);
router.post('/reset-password', AuthController.resetPassword);
router.post('/update-password', AuthController.updatePassword);
router.post('/oauth/:provider', AuthController.signInWithOAuth);*/

export default router;