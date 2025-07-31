import prisma from "../utils/prisma";

export class BarangService {
  async createBarang(data: {nama:string, stok:number, varian: "HALUS" | "KASAR"}) {
    return await prisma.barang.create({
      data,
    });
  }
  async updateBarang( id: string ,data: {nama:string, stok:number, varian: "HALUS" | "KASAR"}) {
    return await prisma.barang.update({
        where: {id},
        data, 
    });
  }
  async deleteBarang(id :string) {
    return await prisma.barang.delete({
      where: {id},
    });
  }
  
  async getBarangId(id:string) {
    return await prisma.barang.findUnique({
      where: {id}
    });
  }
  async getBarang(page = 1, limit = 10, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
     const skip = (page - 1) * limit;

    const allowedSortBy = ['createdAt'];
    const allowedSortOrder = ['asc', 'desc'];

     const sortByFinal = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrderFinal = allowedSortOrder.includes(sortOrder) ? sortOrder : 'desc';

  const [data, total] = await Promise.all([
    prisma.barang.findMany({
      skip,
      take: limit,
      orderBy: {
        [sortByFinal]: sortOrderFinal,
      }
    }),
    prisma.barang.count(),
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
  async getBarangByVarian(varian: "HALUS" | "KASAR") {
  return await prisma.barang.findMany({
    where: { varian },
  });
}

}