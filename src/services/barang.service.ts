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
  async getBarang() {
    return await prisma.barang.findMany();
  }
  async getBarangByVarian(varian: "HALUS" | "KASAR") {
  return await prisma.barang.findMany({
    where: { varian },
  });
}

}