import { Router } from 'express';
import { loginUser, resetPassword, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/login',loginUser ); 
router.post('/resetpass', resetPassword ); 
router.post('/logout', logout ); 

export default router;