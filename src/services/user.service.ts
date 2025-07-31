import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class UserService {
  async createUser(data: {
    NIK: string;
    password: string;
    name: string;
    role: "ADMIN" | "SUPERVISOR";
  }) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = prisma.user.create({
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
      role?: "ADMIN" | "SUPERVISOR";
    }
  ) {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error("Error update user", error);
    }
  }

  async deleteUser(id: string) {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error delete user", error);
    }
  }

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findNIK(NIK: string) {
    return await prisma.user.findUnique({
      where: { NIK },
    });
  }

  async updatePassUser(NIK?: string, newPassword?: string) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword!, 10);

      return await prisma.user.update({
        where: { NIK },
        data: { password: hashedPassword },
      });
    } catch (error) {
      console.error("Error reset Password", error);
    }
  }

  async getAllUser(page : number, limit :number, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;

    const allowedSortBy = ['createdAt'];
    const allowedSortOrder = ['asc', 'desc'];

    const sortByFinal = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrderFinal = allowedSortOrder.includes(sortOrder) ? sortOrder : 'desc';

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
       orderBy: {
        [sortByFinal]: sortOrderFinal,
      }
    }),
    prisma.user.count(),
  ]);

  const totalPage = Math.ceil(total / limit);

  return {
    success: true,
    data,
    total,
    totalPage,
    currentPage: page,
  };
  }


 async updatePassword(userId: string, newPassword: string){
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

  async generateToken(userId: string, roleUser: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the environment variables'); 
    }
    const token = jwt.sign({ id: userId, role:roleUser }, secret, { expiresIn:  60 * 60 * 24 * 7 });

    return token;
  }

}


