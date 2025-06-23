
import { deleteFile } from '../utils/deleteImage';
import prisma from '../utils/prisma';

export class PengembalianService {
  async createPengembalian(data: {
    userId: string;
    fotoUrl: string;
    items: { barangId: string; jumlah: number; kondisi: 'BAIK' | 'RUSAK' }[];
  }) {
    return await prisma.$transaction(async (tx) => {
      // Tambahkan stok ke gudang jika kondisi barang BAIK
      for (const item of data.items) {
        if (item.kondisi === 'BAIK') {
          await tx.barang.update({
            where: { id: item.barangId },
            data: {
              stok: {
                increment: item.jumlah,
              },
            },
          });
        }
      }

      // Simpan data pengembalian dan items-nya
      const created = await tx.pengembalian.create({
        data: {
          userId: data.userId,
          fotoUrl: data.fotoUrl,
          items: {
            create: data.items,
          },
        },
        include: { items: true },
      });

      return created;
    });
  }


  async getAll() {
    return await prisma.pengembalian.findMany({
      include: {
        user: true,
        items: { include: { barang: true } }
      },
    });
  }


  async getById(id: string) {
    return await prisma.pengembalian.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { barang: true } }
      },
    });
  }

  async updatePengembalian(id: string, data: {
  userId: string;
  fotoUrl?: string;
  items: { barangId: string; jumlah: number; kondisi: 'BAIK' | 'RUSAK' }[];
}) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.pengembalian.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new Error('Data pengembalian tidak ditemukan');
    }

   
    if (data.fotoUrl && existing.fotoUrl && data.fotoUrl !== existing.fotoUrl) {
      deleteFile(existing.fotoUrl);
    }

    
    for (const item of existing.items) {
      if (item.kondisi === 'BAIK') {
        await tx.barang.update({
          where: { id: item.barangId },
          data: {
            stok: {
              decrement: item.jumlah,
            },
          },
        });
      }
    }

   
    for (const item of data.items) {
      if (item.kondisi === 'BAIK') {
        await tx.barang.update({
          where: { id: item.barangId },
          data: {
            stok: {
              increment: item.jumlah,
            },
          },
        });
      }
    }

    // 🧹 Hapus item lama
    await tx.pengembalianItem.deleteMany({
      where: { pengembalianId: id }, 
    });

    // 💾 Simpan data baru
    const updated = await tx.pengembalian.update({
      where: { id },
      data: {
        userId: data.userId,
        fotoUrl: data.fotoUrl,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });

    return updated;
  });
}


  async removePengembalian(id: string) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.pengembalian.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new Error('Pengembalian tidak ditemukan');
    }

    
    if (existing.fotoUrl) {
      deleteFile(existing.fotoUrl);
    }

    for (const item of existing.items) {
      if (item.kondisi === 'BAIK') {
        await tx.barang.update({
          where: { id: item.barangId },
          data: {
            stok: {
              decrement: item.jumlah,
            },
          },
        });
      }
    }

    await tx.pengembalian.delete({
      where: { id },
    });

    return { success: true };
  });
}



}