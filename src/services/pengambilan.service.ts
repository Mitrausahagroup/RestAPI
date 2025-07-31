import prisma from "../utils/prisma";
import { Prisma, Status } from "@prisma/client";

export class PengambilanService {
  async getAll(page: number, limit: number, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;

      const allowedSortBy = ['createdAt'];
        const allowedSortOrder = ['asc', 'desc'];

      const sortByFinal = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
      const sortOrderFinal = allowedSortOrder.includes(sortOrder) ? sortOrder : 'desc';

    const [data, total] = await Promise.all([
      prisma.pengambilan.findMany({
        skip,
        take: limit,
        orderBy: {
        [sortByFinal]: sortOrderFinal,
      },
        include: {
          sales: {
            select:{
              id: true,
              nama: true,
            }
          },
          user: true,
          items: {
            include: {
              barang: {
                select: {
                  id: true, 
                  nama: true,
                  varian: true,
                },
              }
            },
          },
        },
      }),
      prisma.pengambilan.count(),
    ]);

    return { data, total };
  }


  async getById(id: string) {
    return await prisma.pengambilan.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            barang: true
          }
        },
        sales: true
      }
    });
  }

  async getByStatus(status: Status) {
    return await prisma.pengambilan.findMany({
      where: { status },
      include: {
        user: true,
        items: {
          include: {
            barang: true
          }
        },
        sales: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

 async createAmbil(data: {
  userId?: string;  // Optional (for admin tracking)
  salesId: string;  // Required
  fotoUrl?: string | null;
  items: { barangId: string; jumlah: number }[];
}) {

  const salesExists = await prisma.sales.findFirst({
    where: { id: data.salesId },
  });
  if (!salesExists) {
    return {
      sukses: false,
      pesan: `Sales dengan ID ${data.salesId} tidak ditemukan`,
    };
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Validate stock for all items
    for (const item of data.items) {
      const barang = await tx.barang.findUnique({
        where: { id: item.barangId },
        select: { stok: true, nama: true }
      });

      if (!barang) {
        throw new Error(`Barang dengan ID ${item.barangId} tidak ditemukan`);
      }
      if (barang.stok < item.jumlah) {
        throw new Error(`Stok barang ${barang.nama} tidak cukup (tersedia: ${barang.stok}, dibutuhkan: ${item.jumlah})`);
      }
    }

    // 2. Prepare the create data
   const pengambilan = await tx.pengambilan.create({
        data: {
          status: "PENDING",
          fotoUrl: data.fotoUrl,
          sales: { connect: { id: data.salesId } },
          ...(data.userId && { user: { connect: { id: data.userId } } }),
          items: {
            create: data.items.map(item => ({
              barang: { connect: { id: item.barangId } },
              jumlah: item.jumlah,
            })),
          },
        },
        include: {
          items: { include: { barang: true } },
          sales: { select: { nama: true } },
          user: data.userId ? { select: { name: true } } : false,
        },
      });
      

    return {
      sukses: true,
      pesan: data.userId  ? 'Pengambilan berhasil dibuat (dibantu admin)' : 'Pengambilan berhasil dibuat',
      data: pengambilan
    };
  });
}

  async updateStatus(id: string, status: Status) {
    return await prisma.$transaction(async (tx) => {
      const pengambilan = await tx.pengambilan.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!pengambilan) {
        return {
          sukses: false,
          pesan: 'Data pengambilan tidak ditemukan'
        };
      }

      // Jika mengubah ke DISETUJUI
      if (status === 'DISETUJUI' && pengambilan.status !== 'DISETUJUI') {
        for (const item of pengambilan.items) {
          const barang = await tx.barang.findUnique({
            where: { id: item.barangId }
          });

          if (!barang || barang.stok < item.jumlah) {
            return {
              sukses: false,
              pesan: `Stok barang tidak cukup untuk ${barang?.nama || item.barangId}`
            };
          }

          await tx.barang.update({
            where: { id: item.barangId },
            data: { stok: barang.stok - item.jumlah }
          });
        }
      }

      // Jika mengubah dari DISETUJUI ke status lain
      if (pengambilan.status === 'DISETUJUI' && status !== 'DISETUJUI') {
        for (const item of pengambilan.items) {
          await tx.barang.update({
            where: { id: item.barangId },
            data: { stok: { increment: item.jumlah } }
          });
        }
      }

      const updated = await tx.pengambilan.update({
        where: { id },
        data: { status }
      });

      return {
        sukses: true,
        pesan: `Status pengambilan berhasil diubah menjadi ${status}`,
        data: updated
      };
    });
  }

  async updateAmbil(id: string, data: {
    userId?: string;
    salesId?: string;
    fotoUrl?: string | null;
    items?: { barangId: string; jumlah: number }[];
}) {
    return await prisma.$transaction(async (tx) => {
        try {
            // 1. Validasi data input
            if (data.items && (!Array.isArray(data.items) || data.items.length === 0)) {
                return {
                    sukses: false,
                    pesan: 'Items harus berupa array dan tidak boleh kosong'
                };
            }

            // 2. Dapatkan data existing dengan lock
            const existing = await tx.pengambilan.findUnique({
                where: { id },
                include: { items: true },
            });

            if (!existing) {
                return {
                    sukses: false,
                    pesan: 'Pengambilan tidak ditemukan'
                };
            }

            // 3. Blokir update jika sudah disetujui
            if (existing.status === 'DISETUJUI') {
                return {
                    sukses: false,
                    pesan: 'Pengambilan yang sudah disetujui tidak dapat diubah',
                    kodeError: 'APPROVED_CANNOT_UPDATE'
                };
            }

            // 4. Validasi stok dengan cek real-time
            if (data.items) {
                for (const item of data.items) {
                    const barang = await tx.barang.findUnique({
                        where: { id: item.barangId },
                        select: { stok: true, nama: true }
                    });

                    if (!barang) {
                        return {
                            sukses: false,
                            pesan: `Barang dengan ID ${item.barangId} tidak ditemukan`,
                            kodeError: 'ITEM_NOT_FOUND'
                        };
                    }

                    // Cek stok dengan mempertimbangkan perubahan
                    const existingItem = existing.items.find(i => i.barangId === item.barangId);
                    const stokAdjustment = existingItem 
                        ? item.jumlah - existingItem.jumlah // Hitung selisih
                        : item.jumlah; // Item baru

                    if (stokAdjustment > 0 && barang.stok < stokAdjustment) {
                        return {
                            sukses: false,
                            pesan: `Stok barang ${barang.nama} tidak cukup`,
                            detail: {
                                stokTersedia: barang.stok,
                                stokDibutuhkan: stokAdjustment
                            }
                        };
                    }
                }
            }

            // 5. Hapus item lama jika ada perubahan
            if (data.items) {
                await tx.pengambilanItem.deleteMany({
                    where: { pengambilanId: id }
                });
            }

            // 6. Update data pengambilan
            const updated = await tx.pengambilan.update({
                where: { id },
                data: {
                    userId: data.userId ?? existing.userId,
                    salesId: data.salesId ?? existing.salesId,
                    fotoUrl: data.fotoUrl !== undefined ? data.fotoUrl : existing.fotoUrl,
                    status: 'PENDING',
                    items: data.items ? {
                        create: data.items.map(item => ({
                            barangId: item.barangId,
                            jumlah: item.jumlah
                        }))
                    } : undefined
                },
                include: {
                    items: { include: { barang: true } },
                    user: true,
                    sales: true
                }
            });

            return {
                sukses: true,
                pesan: 'Pengambilan berhasil diperbarui',
                data: updated
            };

        } catch (error) {
            console.error('Error dalam updateAmbil:', error);
            throw new Error('Terjadi kesalahan saat memperbarui pengambilan');
        }
    });
}
  
async deleteAmbil(id: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Ambil data pengambilan dengan item dan jumlah
      const existing = await tx.pengambilan.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          items: {
            select: {
              id: true,
              barangId: true,
              jumlah: true,
            }
          }
        }
      });

      if (!existing) {
        return {
          sukses: false,
          pesan: 'Pengambilan tidak ditemukan',
          kodeError: 'NOT_FOUND'
        };
      }

      // 2. Jika disetujui, kembalikan stok barang
      if (existing.status === 'DISETUJUI' && existing.items.length > 0) {
        const updateStokPromises = existing.items.map(item =>
          tx.barang.update({
            where: { id: item.barangId },
            data: { stok: { increment: item.jumlah } }
          })
        );
        await Promise.all(updateStokPromises);
      }

      // 3. Hapus semua item pengambilan terlebih dahulu
      await tx.pengambilanItem.deleteMany({
        where: { pengambilanId: id }
      });

      // 4. Baru hapus pengambilan-nya
      await tx.pengambilan.delete({ where: { id } });

      return {
        sukses: true,
        pesan: 'Pengambilan berhasil dihapus'
      };
    });
  } catch (error) {
    console.error(`[DELETE_PENGAMBILAN_ERROR] ID: ${id}`, error);
    return {
      sukses: false,
      pesan: 'Terjadi kesalahan sistem saat menghapus pengambilan',
      kodeError: 'SYSTEM_ERROR'
    };
  }
}


  async getDailyPengambilanSummary (date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const pengambilan = await prisma.pengambilan.findMany({
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

    const total = pengambilan.reduce(
      (sum, p) => sum + p.items.reduce((itemSum, item) => itemSum + (item.jumlah || 0), 0),
      0
    );
    return {
      total,
      count: pengambilan.length,

    };
  } catch (error) {
    console.error('Error in getDailyPengambilanSummary:', error);
    throw error;
  }
};


 
}



