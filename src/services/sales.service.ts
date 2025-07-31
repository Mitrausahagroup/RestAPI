import prisma from "../utils/prisma";

export class SalesService {

  async getAll(page = 1, limit = 10, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;

    
      const allowedSortBy = ['createdAt'];
      const allowedSortOrder = ['asc', 'desc'];

      const sortByFinal = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
      const sortOrderFinal = allowedSortOrder.includes(sortOrder) ? sortOrder : 'desc';

  const [data, total] = await Promise.all([
    prisma.sales.findMany({
      skip,
      take: limit,
      orderBy: {
        [sortByFinal]: sortOrderFinal,
      },
    }),
    prisma.sales.count(),
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

   async getById(id: string) {
    return await prisma.sales.findUnique({
      where: { id }
    })
  }

   async create(data: { nama: string; }) {
    return await prisma.sales.create({
      data
    })
  }

   async update(id: string, data: { nama?: string; }) {
    return await prisma.sales.update({
      where: { id },
      data
    })
  }

   async delete(id: string) {
    return await prisma.sales.delete({
      where: { id }
    })
  }

}


