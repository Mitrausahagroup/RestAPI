import prisma from "../utils/prisma";
import { getAddressFromCoords } from "../utils/geoapify";
import { deleteFile } from "../utils/deleteImage";
import { Prisma } from "@prisma/client";

interface PenurunanItem {
  barangId: string;
  jumlah: number;
}

interface CreatePenurunanData {
  userId?: string;
  salesId: string;
  tokoId: string;
  fotoUrl: string;
  items: PenurunanItem[];
}

interface UpdatePenurunanData {
  userId?: string;
  tokoId: string;
  salesId?: string;
  fotoUrl?: string;
  items?: PenurunanItem[];
}

export class PenurunanService {
  private async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const address = await getAddressFromCoords(lat, lon);
      return address || "Alamat tidak tersedia";
    } catch (error) {
      console.error("Gagal mendapatkan alamat dari koordinat:", error);
      return "Alamat tidak tersedia";
    }
  }

  async createPenurunan(data: CreatePenurunanData) {
    return await prisma.$transaction(async (tx) => {
      // Validate items
      if (!data.items || data.items.length === 0) {
        throw new Error("Minimal harus ada 1 item penurunan");
      }

      // Validate toko exists
      const toko = await tx.toko.findUnique({
        where: { id: data.tokoId },
        select: { id: true }
      });

      if (!toko) {
        throw new Error("Toko tidak ditemukan");
      }

      // Create penurunan
      const penurunan = await tx.penurunan.create({
        data: {
          salesId: data.salesId,
          tokoId: data.tokoId,
          fotoUrl: data.fotoUrl,
          items: {
            create: data.items.map(item => ({
              barangId: item.barangId,
              jumlah: item.jumlah
            }))
          }
        },
        include: { 
          items: {
            include: {
              barang: {
                select: {
                  id: true,
                  nama: true
                }
              }
            }
          },
          sales: {
            select: {
              nama: true
            }
          },
          toko: {
            select: {
              nama: true,
              alamat: true,
              noHp: true
            }
          }
        }
      });

      return {
        success: true,
        data: penurunan,
        message: "Penurunan berhasil dibuat"
      };
    }).catch(error => {
      console.error("Gagal membuat penurunan:", error);
      throw new Error(error.message || "Terjadi kesalahan saat membuat penurunan");
    });
  }

  async getAllPenurunan(page: number , limit: number , sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    try {

      const allowedSortBy = ['createdAt'];
      const allowedSortOrder = ['asc', 'desc'];

      const sortByFinal = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
      const sortOrderFinal = allowedSortOrder.includes(sortOrder) ? sortOrder : 'desc';

      const [penurunans, total] = await Promise.all([
        prisma.penurunan.findMany({
          skip: (page - 1) * limit,
          take: limit,
          include: {
            sales: {
              select: {
                id: true,
                nama: true
              }
            },
            items: {
              include: {
                barang: {
                  select: {
                    id: true,
                    nama: true,
                    varian: true,
                  }
                }
              }
            },
            toko: {
              select: {
                nama: true,
                alamat: true,
              }
            }
          },
          orderBy: {
        [sortByFinal]: sortOrderFinal,
      }
        }),
        prisma.penurunan.count()
      ]);

      return {
        success: true,
        data: penurunans,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error("Gagal mengambil data penurunan:", error);
      throw new Error("Terjadi kesalahan saat mengambil data penurunan");
    }
  }

  async getPenurunanById(id: string) {
    try {
      const penurunan = await prisma.penurunan.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true } },
          sales: { select: { id: true, nama: true } },
          items: {
            include: {
              barang: { select: { id: true, nama: true } }
            }
          },
          toko: { select: { id: true, nama: true, alamat: true } }
        }
      });

      return {
        success: true,
        data: penurunan
      };
    } catch (error) {
      console.error(`Gagal mengambil penurunan ID ${id}:`, error);
      throw new Error("Terjadi kesalahan saat mengambil data penurunan");
    }
  }

  async updatePenurunan(id: string, data: UpdatePenurunanData) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.penurunan.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!existing) {
        throw new Error("Data penurunan tidak ditemukan");
      }

      // Handle foto
      if (data.fotoUrl && existing.fotoUrl && data.fotoUrl !== existing.fotoUrl) {
        deleteFile(existing.fotoUrl)
      }


      // Hapus item lama jika ada perubahan items
      if (data.items) {
        await tx.penurunanItem.deleteMany({ 
          where: { penurunanId: id } 
        });
      }

      const updated = await tx.penurunan.update({
        where: { id },
        data: {
          tokoId: data.tokoId ?? existing.tokoId,
          fotoUrl: data.fotoUrl ?? existing.fotoUrl,
          salesId: data.salesId ?? existing.salesId,
          items: data.items
            ? {
                create: data.items.map(item => ({
                  barangId: item.barangId,
                  jumlah: item.jumlah
                }))
              }
            : undefined
        },
        include: {
          items: {
            include: {
              barang: {
                select: {
                  id: true,
                  nama: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          },
          toko: {
            select: {
              id: true,
              nama: true
            }
          }
        }
      });

      return {
        success: true,
        data: updated,
        message: "Penurunan berhasil diperbarui"
      };
    }).catch(error => {
      console.error(`Gagal update penurunan ID ${id}:`, error);
      throw new Error(error.message || "Terjadi kesalahan saat memperbarui penurunan");
    });
  }

  async removePenurunan(id: string) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.penurunan.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!existing) {
        throw new Error("Data penurunan tidak ditemukan");
      }

      // Hapus file foto jika ada
      if (existing?.fotoUrl) {
       deleteFile(existing.fotoUrl)
      }

      await tx.penurunanItem.deleteMany({
      where: { penurunanId: id }
    });


      await tx.penurunan.delete({
        where: { id }
      });

      return {
        success: true,
        message: "Penurunan berhasil dihapus"
      };
    }).catch(error => {
      console.error(`Gagal hapus penurunan ID ${id}:`, error);
      throw new Error(error.message || "Terjadi kesalahan saat menghapus penurunan");
    });
  }



  async getDailyDeliverySummary (date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const delivery = await prisma.penurunan.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: true,
      },
    });

    const total = delivery.reduce(
      (sum, p) => sum + p.items.reduce((itemSum, item) => itemSum + (item.jumlah || 0), 0),
      0
    );
    return {
      total,
      count: delivery.length,

    };
  } catch (error) {
    console.error( error);
    throw error;
  }
};


}