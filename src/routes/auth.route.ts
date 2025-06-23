import { Router } from 'express';
import { loginUser, resetPassword } from '../controllers/auth.controller';

const router = Router();

router.post('/login',loginUser ); 
router.post('/resetpass', resetPassword ); 

export default router;