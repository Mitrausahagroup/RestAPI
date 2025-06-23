import prisma from "../utils/prisma";

export class PengambilanService {

   async getById(id: string) {
    return await prisma.pengambilan.findUnique({
      where: { id },
    });
  }
 
async createPengambilan(data: {
    userId: string;
    fotoUrl: string;
    items: { barangId: string; jumlah: number }[];
  }) {
    return await prisma.pengambilan.create({
      data: {
        userId: data.userId,
        fotoUrl: data.fotoUrl,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, status: 'DISETUJUI' | 'DITOLAK') {
    return await prisma.$transaction(async (tx) => {
      const pengambilan = await tx.pengambilan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!pengambilan) {
        return {
            success: false,
            message: 'Data pengambilan tidak ditemukan',
        }
      }

      if (status === 'DISETUJUI') {
        for (const item of pengambilan!.items) {
          const barang = await tx.barang.findUnique({
            where: { id: item.barangId },
          });

          if (!barang || barang.stok < item.jumlah) {
            return {
            success: false,
            message: `Stok barang '${item.barangId}' tidak cukup.` ,
           }
          }

          await tx.barang.update({
            where: { id: item.barangId },
            data: { stok: barang.stok - item.jumlah },
          });
        }
      }

      const updated = await tx.pengambilan.update({
      where: { id },
      data: { status },
    });


      return {
      success: true,
      message: `Status berhasil diubah menjadi ${status}`,
      data: updated,
    };
    });
  }


  async getAll() {
     return await prisma.pengambilan.findMany({
      include: {
        user: true,
        items: true,
      }
    })
  }

  async getByStatus(status: 'PENDING' | 'DISETUJUI' | 'DITOLAK') {
        return await prisma.pengambilan.findMany({
            where:{status},
            include: {
                user: true,
                items: true
            }
        })
  }


  async updatePengambilan(id: string, data: {
  userId: string;
  fotoUrl?: string;
  items: { barangId: string; jumlah: number }[];
}) {
  return await prisma.$transaction(async (tx) => {

   const existing = await tx.pengambilan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing || existing.status == 'DISETUJUI') {
       return {
          success: false,
          message: `Pengambilan sudah diproses dan tidak dapat diubah`,
    };
    }

    // Hapus item lama
    await tx.pengambilanItem.deleteMany({
      where: { pengambilanId: id },
    });

    // Update data utama
    const updated = await tx.pengambilan.update({
      where: { id },
      data: {
        userId: data.userId,
        fotoUrl: data.fotoUrl ?? existing.fotoUrl, // bisa undefined
        status: 'PENDING',
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });

    return updated;
  });
}


async removePengambilan(id: string) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.pengambilan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        return {
          success: false,
          message: 'Pengambilan tidak ditemukan',
        };
      }

      if (existing.status === 'DISETUJUI') {
        for (const item of existing.items) {
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

      await tx.pengambilan.delete({
        where: { id },
      });

      return { success: true };
    });
  }
}



   
 

