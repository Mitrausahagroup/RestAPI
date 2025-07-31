import { getAddressFromCoords } from "../utils/geoapify"
import prisma from "../utils/prisma"

export class TokoService {
async getAll(page :number , limit: number , sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
  const skip = (page - 1) * limit;

    const allowedSortBy = ['createdAt'];
    const allowedSortOrder = ['asc', 'desc'];

     const sortByFinal = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrderFinal = allowedSortOrder.includes(sortOrder) ? sortOrder : 'desc';

  const [data, total] = await Promise.all([
    prisma.toko.findMany({
      skip,
      take: limit,
      include: { sales: true },
       orderBy: {
        [sortByFinal]: sortOrderFinal,
      }
    }),
    prisma.toko.count(),
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
    return await prisma.toko.findUnique({
      where: { id },
      include: { sales: true }
    })
  }

   async getByBarcodeId(barcodeId: string) {
    return await prisma.toko.findFirst({
      where: { barcodeId: barcodeId },
      include: { 
        sales: true,
       }
    })
  }

  async update(id: string, data: { 
    nama?: string, 
    salesId?: string, 
    noHp?: string, 
    fotoUrl?: string,
    lat?: number,
    lon?: number,
    alamat?: string  } ) {
    return await prisma.toko.update({
      where: { id },
      data
    })
  }

   async delete(id: string) {
    return await prisma.toko.delete({
      where: { id }
    })
  }

  async create(data: {
    nama: string
    barcodeId: string
    salesId: string
    noHp: string
    fotoUrl: string
    lat: number
    lon: number

  }) {
    const { nama, barcodeId, salesId, noHp , fotoUrl, lat, lon } = data

    let alamat = ''
    if (lat && lon) {
      alamat = await getAddressFromCoords(lat, lon)
    }

    const barcode = await prisma.barcode.findUnique({
      where: { id: barcodeId }
    })

    if (!barcode) {
      return {
        succes: false,
        message: "barcode tidak ditemukan"
      }
    }

    if (barcode.isUsed) {
       return {
        succes: false,
        message: "barcode sudah digunakan"
      }
    }


    const toko = await prisma.toko.create({
      data: {
        nama,
        barcode: {connect: {id: barcodeId}},
        sales: {connect: {id: salesId}},
        noHp,
        fotoUrl,
        alamat,
        lat,
        lon,
      } ,
      include: {
        sales: true,
        barcode: true,
      }
    })

    // Update barcode (optional, jika mau tandai sebagai used)
    await prisma.barcode.update({
      where: { id: barcodeId },
      data: { usedBy: toko.id, isUsed: true }
    })

    return toko
  }
}


