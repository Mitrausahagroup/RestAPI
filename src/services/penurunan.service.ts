import path from "path";
import fs from 'fs'
import prisma from "../utils/prisma";
import axios from "axios";
import { deleteFile } from "../utils/deleteImage";

export class PenurunanService {
  async createPenurunan(data: {
    userId: string;
    toko: string;
    fotoUrl: string;
    latitude: number;
    longitude: number;
    items: { barangId: string; jumlah: number }[];
  }) {
    try {
      const alamat = await this.reverseGeocode(data.latitude, data.longitude);

      const penurunan = await prisma.penurunan.create({
        data: {
          userId: data.userId,
          toko: data.toko,
          fotoUrl: data.fotoUrl,
          alamat,
          items:{
            create: data.items,
          }
        },
         include: { items: true },
      });

      return penurunan;
    } catch (error) {
      console.error("Gagal menyimpan penurunan:", error);
      throw new Error("Terjadi kesalahan saat menyimpan penurunan");
    }
  }

   async getAllPenurunan() {
    return await prisma.penurunan.findMany({
      include: {
        user: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

    async getPenurunanById(id: string) {
    return await prisma.penurunan.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
      },
    });
  }


   async updatePenurunan(id: string, data: {
    userId: string;
    toko: string;
    fotoUrl?: string;
    latitude?: number;
    longitude?: number;
    items: { barangId: string; jumlah: number }[];
  }) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.penurunan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        return { success: false, message: 'Data tidak ditemukan' };
      }

      // Hapus file lama jika foto baru dikirim
     if (data.fotoUrl && existing.fotoUrl && data.fotoUrl !== existing.fotoUrl) {
            deleteFile(existing.fotoUrl);
        }

      // Ambil alamat baru jika ada lat/lon baru
      let alamat = existing.alamat;
      if (data.latitude && data.longitude) {
        alamat = await this.reverseGeocode(data.latitude, data.longitude);
      }

      // Hapus item lama
      await tx.penurunanItem.deleteMany({ where: { penurunanId: id } });

      const updated = await tx.penurunan.update({
        where: { id },
        data: {
          userId: data.userId,
          toko: data.toko,
          fotoUrl: data.fotoUrl ?? existing.fotoUrl,
          alamat,
          items: {
            create: data.items,
          },
        },
        include: { items: true },
      });

      return { success: true, data: updated };
    });
  }


   async removePenurunan(id: string) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.penurunan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        return { success: false, message: "Data tidak ditemukan" };
      }

     if(existing.fotoUrl){
        deleteFile(existing.fotoUrl)
     }

      await tx.penurunan.delete({
        where: { id },
      });

      return { success: true };
    });
  }


  private async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const key = process.env.LOCATIONIQ_API_KEY!;
      const res = await axios.get(`https://us1.locationiq.com/v1/reverse`, {
        params: {
          key,
          lat,
          lon,
          format: "json",
        },
      });
      return res.data.display_name;
    } catch (err) {
      console.error("Geocoding error:", err);
      return "Alamat tidak ditemukan";
    }
  }

}
