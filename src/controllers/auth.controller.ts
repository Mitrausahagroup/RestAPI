import { Request, Response } from "express";
import { UserService } from "../services/user.service";4
import bcrypt from 'bcrypt'

const userService= new UserService()

export const loginUser  = async (req: Request, res: Response) => {
    try {
      const { NIK, password } = req.body;
      const user = await userService.findNIK(NIK);
  
      if (!user) {
         res.status(401).json({ error: 'Invalid NIK' });
         return
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
         res.status(401).json({ error: 'Invalid password' });
         return
      }
  
      const token = await userService.generateToken(user.id, user.role);
      res.status(200).json({ user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to login' });
    }
  };


  export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { NIK, newPassword } = req.body;

    const user = await userService.findNIK(NIK);
    if (!user) {
      res.status(404).json({ error: 'User dengan NIK tersebut tidak ditemukan' });
      return;
    }
    await userService.updatePassword(user!.id, newPassword);
    res.status(200).json({ message: 'Password berhasil direset' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mereset password' });
  }
};



export const logout = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // true jika HTTPS (di production)
    path: "/", // pastikan sama dengan path saat set cookie
  })

  res.clearCookie("user", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // true jika HTTPS (di production)
    path: "/", // pastikan sama dengan path saat set cookie
  })

   res.status(200).json({ message: "Logout berhasil" })
}



