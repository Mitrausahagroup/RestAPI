import { deleteFile } from '../utils/deleteImage';
import prisma from '../utils/prisma';

interface PengembalianItem {
  barangId: string;
  jumlah: number;
  kondisi: 'BAIK' | 'RUSAK';
}

interface CreatePengembalianData {
  salesId: string;
  userId?: string;
  fotoUrl: string;
  items: PengembalianItem[];
}

interface UpdatePengembalianData {
  salesId?: string;
  userId?: string;
  fotoUrl?: string;
  items?: PengembalianItem[];
}

export class PengembalianService {
  async createPengembalian(data: CreatePengembalianData) {
    return await prisma.$transaction(async (tx) => {
      // Validate sales exists
      const sales = await tx.sales.findUnique({
        where: { id: data.salesId },
        select: { id: true }
      });
      if (!sales) {
        throw new Error('Sales tidak valid');
      }

      // Validate user if provided
      let userConnect = {};
      if (data.userId) {
        const user = await tx.user.findUnique({
          where: { id: data.userId },
          select: { id: true, role: true }
        });
        
        if (!user || user.role !== 'ADMIN') {
          throw new Error('User harus admin');
        }
        userConnect = { connect: { id: data.userId } };
      }

      // Validate items
      if (!data.items || data.items.length === 0) {
        throw new Error('Minimal harus ada 1 item pengembalian');
      }

      // Update stock for good condition items
      const goodItems = data.items.filter(i => i.kondisi === 'BAIK');
      for (const item of goodItems) {
        await tx.barang.update({
          where: { id: item.barangId },
          data: { stok: { increment: item.jumlah } }
        });
      }

      // Create return record
      const created = await tx.pengembalian.create({
        data: {
          sales: { connect: { id: data.salesId } },
          user: userConnect,
          fotoUrl: data.fotoUrl,
          items: {
            create: data.items.map(item => ({
              barangId: item.barangId,
              jumlah: item.jumlah,
              kondisi: item.kondisi
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
              id: true,
              nama: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return {
        success: true,
        data: created,
        message: data.userId 
          ? 'Pengembalian dicatat oleh admin'
          : 'Pengembalian berhasil dibuat'
      };
    }).catch(error => {
      console.error('Gagal membuat pengembalian:', error);
      throw new Error(error.message || 'Terjadi kesalahan saat membuat pengembalian');
    });
  }

  async getAll(page: number , limit: number , sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc' ) {
    try {

        const allowedSortBy = ['createdAt'];
        const allowedSortOrder = ['asc', 'desc'];

      const sortByFinal = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
      const sortOrderFinal = allowedSortOrder.includes(sortOrder) ? sortOrder : 'desc';

      const [pengembalians, total] = await Promise.all([
        prisma.pengembalian.findMany({
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            },
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
            }
          },
           orderBy: {
        [sortByFinal]: sortOrderFinal,
      }
        }),
        prisma.pengembalian.count()
      ]);

      return {
        success: true,
        data: pengembalians,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Gagal mengambil data pengembalian:', error);
      throw new Error('Terjadi kesalahan saat mengambil data pengembalian');
    }
  }

  async getById(id: string) {
    try {
      const pengembalian = await prisma.pengembalian.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
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
                }
              }
            }
          }
        }
      });

      if (!pengembalian) {
        throw new Error('Data pengembalian tidak ditemukan');
      }

      return {
        success: true,
        data: pengembalian
      };
    } catch (error) {
      console.error(`Gagal mengambil pengembalian ID ${id}:`, error);
      
    }
  }

  async updatePengembalian(id: string, data: UpdatePengembalianData) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.pengembalian.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!existing) {
        throw new Error('Data pengembalian tidak ditemukan');
      }

      // Validate user if provided
      if (data.userId) {
        const user = await tx.user.findUnique({
          where: { id: data.userId },
          select: { role: true }
        });
        if (!user || user.role !== 'ADMIN') {
          throw new Error('Hanya admin yang bisa update');
        }
      }

      // Handle photo update
      if (data.fotoUrl && existing.fotoUrl && data.fotoUrl !== existing.fotoUrl) {
         deleteFile(existing.fotoUrl)
      }

      // Revert previous stock adjustments
      const previousGoodItems = existing.items.filter(i => i.kondisi === 'BAIK');
      for (const item of previousGoodItems) {
        await tx.barang.update({
          where: { id: item.barangId },
          data: { stok: { decrement: item.jumlah } }
        });
      }

      // Apply new stock adjustments if items are provided
      if (data.items) {
        const newGoodItems = data.items.filter(i => i.kondisi === 'BAIK');
        for (const item of newGoodItems) {
          await tx.barang.update({
            where: { id: item.barangId },
            data: { stok: { increment: item.jumlah } }
          });
        }
      }

      // Update record
      const updated = await tx.pengembalian.update({
        where: { id },
        data: {
          ...(data.salesId && { sales: { connect: { id: data.salesId } } }),
          ...(data.userId && { user: { connect: { id: data.userId } } }),
          fotoUrl: data.fotoUrl ?? existing.fotoUrl,
          ...(data.items && {
            items: {
              deleteMany: { pengembalianId: id },
              create: data.items.map(item => ({
                barangId: item.barangId,
                jumlah: item.jumlah,
                kondisi: item.kondisi
              }))
            }
          })
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
              id: true,
              nama: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return {
        success: true,
        data: updated,
        message: 'Pengembalian berhasil diperbarui'
      };
    }).catch(error => {
      console.error(`Gagal update pengembalian ID ${id}:`, error);
      throw new Error(error.message || 'Terjadi kesalahan saat memperbarui pengembalian');
    });
  }

  async removePengembalian(id: string) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.pengembalian.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existing) {
      throw new Error('Pengembalian tidak ditemukan');
    }


    // Kembalikan stok barang yang kondisi BAIK
    const goodItems = existing.items.filter(i => i.kondisi === 'BAIK');
    for (const item of goodItems) {
      await tx.barang.update({
        where: { id: item.barangId },
        data: {
          stok: { decrement: item.jumlah }
        }
      });
    }

    // Hapus semua items terkait pengembalian
    await tx.pengembalianItem.deleteMany({
      where: { pengembalianId: id }
    });

    // Hapus file foto jika ada
    if (existing?.fotoUrl) {
      deleteFile(existing.fotoUrl);
    }

    // Hapus data pengembalian
    await tx.pengembalian.delete({
      where: { id }
    });

    return {
      success: true,
      message: 'Pengembalian berhasil dihapus'
    };
  }).catch(error => {
    console.error(`Gagal hapus pengembalian ID ${id}:`, error);
    throw new Error(error.message || 'Terjadi kesalahan saat menghapus pengembalian');
  });
}


  async getDailyPengembalianSummary (date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const pengembalian = await prisma.pengembalian.findMany({
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

    const total = pengembalian.reduce(
      (sum, p) => sum + p.items.reduce((itemSum, item) => itemSum + (item.jumlah || 0), 0),
      0
    );
    return {
      total,
      count: pengembalian.length,

    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

}