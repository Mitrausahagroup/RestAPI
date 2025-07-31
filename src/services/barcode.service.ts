// services/barcode.service.ts
import { v4 as uuidv4 } from 'uuid'
import prisma from '../utils/prisma'

export class BarcodeService {
  async generateMany(count: number) {
    const data = Array.from({ length: count }, () => ({ id: uuidv4() }))
     await prisma.barcode.createMany({ data })
     return data;
  }

  async generateOne() {
    return await prisma.barcode.create({
      data: { id: uuidv4() }
    })
  }

  async getAll(page = 1, limit = 10, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;

    const allowedSortBy = ['createdAt'];
    const allowedSortOrder = ['asc', 'desc'];

     const sortByFinal = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrderFinal = allowedSortOrder.includes(sortOrder) ? sortOrder : 'desc';

  const [data, total] = await Promise.all([
    prisma.barcode.findMany({
      skip,
      take: limit,
      include: {toko: true}, 
      orderBy: {
        [sortByFinal]: sortOrderFinal,
      }
    }),
    prisma.barcode.count(),
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

  async getUnused() {
    return await prisma.barcode.findMany({
      where: { isUsed: false }
    })
  }

  async getById(id: string) {
    return await prisma.barcode.findUnique({ where: { id } })
  }

  async deleteAll() {
    return await prisma.barcode.deleteMany()
  }

  async deleteById(id: string) {
    return await prisma.barcode.delete({ where: { id } })
  }
}
