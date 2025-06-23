import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class UserService {
  async createUser(data: {
    NIK: string;
    password: string;
    name: string;
    role: "ADMIN" | "SUPERVISOR" | "SALES";
  }) {
    try {

  const existingUser = await prisma.users.findUnique({
    where: { NIK: data.NIK },
  });

  if (existingUser) {
     return {
            success: false,
            message: 'NIK sudah terpakai',
        }
  }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = prisma.users.create({
        data: {
          NIK: data.NIK,
          password: hashedPassword,
          name: data.name,
          role: data.role,
        },
      });
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }

  async updateUser(
    id: string,
    data: {
      NIK?: string;
      password?: string;
      name?: string;
      role?: "ADMIN" | "SUPERVISOR" | "SALES";
    }
  ) {
    try {
      return await prisma.users.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error("Error update user", error);
    }
  }

  async deleteUser(id: string) {
    try {
      return await prisma.users.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error delete user", error);
    }
  }

  async getUserById(id: string) {
    return await prisma.users.findUnique({
      where: { id },
    });
  }

  async findNIK(NIK: string) {
    return await prisma.users.findUnique({
      where: { NIK },
    });
  }

  async updatePassUser(NIK?: string, newPassword?: string) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword!, 10);

      return await prisma.users.update({
        where: { NIK },
        data: { password: hashedPassword },
      });
    } catch (error) {
      console.error("Error reset Password", error);
    }
  }

  async getAllUser() {
    return await prisma.users.findMany()
  }


 async updatePassword(userId: string, newPassword: string){
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return prisma.users.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

  async generateToken(userId: string, roleUser: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the environment variables'); 
    }
    const token = jwt.sign({ id: userId, role:roleUser }, secret, { expiresIn: '1h' });

    return token;
  }

}


