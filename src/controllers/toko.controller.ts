import { Request, Response } from "express";
import { TokoService } from "../services/toko.service";
import { BarcodeService } from "../services/barcode.service";
import prisma from "../utils/prisma";
import { uploadCompressedImage } from "../utils/uploadImage";
import fs from 'fs'
import path from "path";

const tokoService = new TokoService();
const barcodeService = new BarcodeService()


// Get all toko
export const getAllToko = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

     const sortBy = (req.query.sortBy as string) || 'createdAt';
    const rawSortOrder = req.query.sortOrder as string;
    const sortOrder = rawSortOrder === 'asc' || rawSortOrder === 'desc' ? rawSortOrder : 'desc';

    const result = await tokoService.getAll(page, limit, sortBy, sortOrder);

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      totalPage: result.totalPage,
      currentPage: result.currentPage,
    });
  } catch (err) {
    console.error("Error getAllToko:", err);
    res.status(500).json({ message: "Gagal mengambil data toko" });
  }
};

// Get toko by ID
export const getTokoById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const toko = await tokoService.getById(id);
    if (!toko) {
       res.status(404).json({ message: "Toko tidak ditemukan" });
    }
    res.json({
      succes: true,
      data: toko,
    });
  } catch (err) {
    console.error("Error getTokoById:", err);
    res.status(500).json({ message: "Gagal mengambil data toko" });
  }
};

export const getTokoBybarcodeId = async (req: Request, res: Response) => {
  const { barcodeId } = req.params

  // 1. Validasi format UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  if (!isUUID.test(barcodeId)) {
     res.status(400).json({ message: 'Barcode tidak valid' })
  }

  try {
    // 2. Cek apakah barcode ada
    const checkBarcode = await barcodeService.getById(barcodeId)
    if (!checkBarcode) {
       res.status(404).json({ message: 'Barcode tidak ditemukan' })
    }

    // 3. Cek apakah barcode sudah digunakan oleh toko
    const toko = await tokoService.getByBarcodeId(barcodeId)

    if (!toko) {
       res.json({
        status: 'unused',
        barcodeId,
      })
    }

    // 4. Jika sudah digunakan, kirim data toko
     res.json({
      status: 'used',
      toko,
    })

  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil data toko" })
  }
}

// Create toko
export const createToko = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { nama, barcodeId, salesId, noHp, lat, lon } = req.body;

    console.log(nama, barcodeId, salesId, noHp, lat, lon)

    const findSales = await prisma.sales.findFirst({
      where: { id: salesId }
    });

    if (!findSales) {
       res.status(404).json({
        sukses: false,
        pesan: 'Sales tidak ditemukan'
      });
    }

    let fotoUrl = ''; 
    if (file) {
      fotoUrl = await uploadCompressedImage(file.buffer, {
        prefix: "toko",
        salesName: findSales!.nama
      });
    }

    const toko = await tokoService.create({
      nama,
      barcodeId,
      salesId,
      noHp,
      fotoUrl,
      lat: parseFloat(lat),   // convert to number
      lon: parseFloat(lon)    // convert to number
    });

    res.status(201).json({
      success: true,
      message: "Toko berhasil dibuat",
      data: toko
    });

  } catch (err) {
    console.error("❌ Gagal membuat toko:", err);
    res.status(500).json({ message: "Gagal membuat toko" });
  }
};


// Update toko
export const updateToko = async (req: Request, res: Response) => {
  const { id } = req.params;

  const findtoko = await tokoService.getById(id);
  if (!findtoko) {
     res.status(404).json({ error: "Toko tidak ditemukan" });
  }

  try {
    // Hapus foto lama jika ada file baru diupload
    let newFoto = findtoko!.fotoUrl;

    if (req.file) {
      // Hapus foto lama
      if (findtoko!.fotoUrl) {
       const oldPath = path.join(__dirname, '../../uploads/', findtoko!.fotoUrl);
               if (fs.existsSync(oldPath)) {
                 fs.unlinkSync(oldPath);
               }
      }
      newFoto = await uploadCompressedImage(req.file.buffer ,{
        prefix: 'toko',
      } );
    }

    const tokoData = {
      nama: req.body.nama || findtoko!.nama,
      sales: req.body.salesId ? { connect: { id: req.body.salesId } } : null ,
      noHp: req.body.noHp || findtoko!.noHp,
      alamat: req.body.alamat || findtoko!.alamat,
      lat: req.body.lat || findtoko!.lat,
      lon: req.body.lon || findtoko!.lon,
      fotoUrl: newFoto,
    };

    const updated = await tokoService.update(id, tokoData);
    res.json(updated);
  } catch (err) {
    console.error("Error updateToko:", err);
    res.status(500).json({ message: "Gagal update toko" });
  }
};

// Delete toko
export const deleteToko = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await tokoService.delete(id);
    res.json({ message: "Toko berhasil dihapus" });
  } catch (err) {
    console.error("Error deleteToko:", err);
    res.status(500).json({ message: "Gagal hapus toko" });
  }
};
