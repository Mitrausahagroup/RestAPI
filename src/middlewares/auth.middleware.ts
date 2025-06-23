
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
     res.sendStatus(401); 
     console.log("token not found")
     return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables'); 
  }

  if (token) {
    jwt.verify(token, secret, (error: any, decoded: any) => {
        if (error) {
             res.status(404).json({
                message: error,
                error
            });
        } else {
            res.locals.jwt = decoded;
            next();
        }
    });
} else {
     res.status(401).json({
        message: 'Unauthorized'
    });
}


};