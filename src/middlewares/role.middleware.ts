import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = res.locals?.jwt?.role;
    
    if (!userRole) {
      res.status(403).json({ message: "Akses ditolak, Role tidak ditemukan" });
    } else{
      if (!roles.includes(userRole)) {
        res.status(403).json({ message: "Akses ditolak, Role tidak memadai" });
     } else {
        next();
     }
    }
  };
};
