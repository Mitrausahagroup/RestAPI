import { PengambilanService } from "../services/pengambilan.service";
import { Request, Response } from "express";
import { uploadCompressedImage } from '../utils/uploadImage';
import path from "path";
import fs from 'fs';
import { Status } from "@prisma/client";
import prisma from "../utils/prisma";

const ambilService = new PengambilanService();

export const getAllPengambilan = async (req: Request, res: Response) => {
  try {

     const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

     const sortBy = (req.query.sortBy as string) || 'createdAt';
    const rawSortOrder = req.query.sortOrder as string;
    const sortOrder = rawSortOrder === 'asc' || rawSortOrder === 'desc' ? rawSortOrder : 'desc';

    const { data, total } = await ambilService.getAll(page, limit, sortBy, sortOrder);

    const totalPage = Math.ceil(total / limit);

    res.status(200).json({
      sukses: true,
      data,
      total,
      page,
      limit,
      totalPage,
    });
  } catch (error) {
    console.error('Gagal mengambil semua pengambilan:', error);
    res.status(500).json({ 
      sukses: false,
      pesan: 'Gagal mengambil data pengambilan' 
    });
  }
};

export const getPengambilanByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;

    if (!Object.values(Status).includes(status as Status)) {
       res.status(400).json({ 
        sukses: false,
        pesan: 'Status tidak valid' 
      });
    }

    const pengambilan = await ambilService.getByStatus(status as Status);
    res.status(200).json({
      sukses: true,
      data: pengambilan
    });
  } catch (error) {
    console.error('Gagal mengambil pengambilan by status:', error);
    res.status(500).json({ 
      sukses: false,
      pesan: 'Gagal mengambil data pengambilan' 
    });
  }
};

export const createPengambilan = async (req: Request, res: Response) => {
  try { 
    const file = req.file;
    const { salesId } = req.body; 

     const findSales = await prisma.sales.findFirst({
      where: {id :salesId}
    })

    if (!findSales) {
      res.status(404).json({
        sukses: false,
        pesan: 'Sales tidak ditemukan'
      });
    }

    let items: { barangId: string; jumlah: number }[] = [];

    try {
      items = typeof req.body.items === 'string' ? 
        JSON.parse(req.body.items) : 
        req.body.items;
    } catch (error) {
       res.status(400).json({
        sukses: false,
        pesan: 'Format items tidak valid'
      });
    }

    if (!Array.isArray(items)) {
       res.status(400).json({
        sukses: false,
        pesan: 'Items harus berupa array'
      });
    }

    if (items.length === 0) {
       res.status(400).json({
        sukses: false,
        pesan: 'Items tidak boleh kosong'
      });
    }

    let fotoUrl: string | null = null;
    if (file) {
      fotoUrl = await uploadCompressedImage(file.buffer, {
        prefix: "pengambilan",
        salesName: findSales?.nama
      });
    }

    const userId = res.locals.jwt?.id;

    const result = await ambilService.createAmbil({
      userId,
      salesId,
      fotoUrl,
      items
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Gagal membuat pengambilan:', error);
    res.status(500).json({ 
      sukses: false,
      pesan: error.message || 'Gagal membuat pengambilan' 
    });
  }
};

export const updateStatusPengambilan = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.params;

    if (!['DISETUJUI', 'DITOLAK'].includes(status)) {
       res.status(400).json({
        sukses: false,
        pesan: 'Status tidak valid'
      });
    }

    const result = await ambilService.updateStatus(id, status as Status);
    res.status(200).json(result);
  } catch (err: any) {
    console.error('Gagal memperbarui status:', err);
    res.status(500).json({ 
      sukses: false,
      pesan: err.message || 'Gagal memperbarui status pengambilan' 
    });
  }
};

export const updatePengambilan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { salesId, items } = req.body;
    
    const findSales = await prisma.sales.findFirst({ where: { id: salesId } });

    const existing = await ambilService.getById(id);
    if (!existing) {
      res.status(404).json({
        sukses: false,
        pesan: 'Data pengambilan tidak ditemukan'
      });
      return;
    }

    let parsedItems;
        try {
          parsedItems = JSON.parse(items); // items dari frontend adalah string JSON
        } catch (e) {
         res.status(400).json({
            success: false,
            error: "Format items tidak valid",
          });
          return
        }

        console.log(salesId, parsedItems)
    

    const file = req.file;


    let fotoUrl: string | null = existing.fotoUrl;

    if (file) {
      if (existing.fotoUrl) {
        const oldPath = path.join(__dirname, '../../uploads/', existing.fotoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      fotoUrl = await uploadCompressedImage(file.buffer, {
        prefix: 'pengambilan',
      });
    }

    const result = await ambilService.updateAmbil(id, {
      salesId,
      fotoUrl,
      items: parsedItems
    });

    res.status(200).json(result); 
  } catch (err: any) {
    console.error('Gagal memperbarui pengambilan:', err);
    res.status(500).json({ 
      sukses: false,
      pesan: err.message || 'Gagal memperbarui pengambilan' 
    });
  }
};



export const deletePengambilan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await ambilService.getById(id);

    if (!existing) {
       res.status(404).json({
        sukses: false,
        pesan: 'Pengambilan tidak ditemukan'
      });
    }

    const result = await ambilService.deleteAmbil(id);

    // Hapus foto terkait jika ada
    if (existing!.fotoUrl) {
      const filePath = path.join(__dirname, '../../uploads/', existing!.fotoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Gagal menghapus pengambilan:', error);
    res.status(500).json({ 
      sukses: false,
      pesan: error.message || 'Gagal menghapus pengambilan' 
    });
  }


};


export const getDailySummary = async (req: Request, res: Response) =>  {

  try {
    // Get date from query params or use current date
    const date = req.query.date ? new Date(req.query.date as string) : new Date();

    // Validate date
    if (isNaN(date.getTime())) {
       res.status(400).json({
        sukses: false,
        pesan: 'Format tanggal tidak valid',
      });
    }

    // Get summary from service
    const result = await ambilService.getDailyPengambilanSummary(date);

    if (!result) {
       res.status(500).json(result);
    }

     res.status(200).json({
      sukses: true,
      total: result.total,
      count: result.count,
    });
  } catch (error) {
    console.error(error);
     res.status(500).json({
      sukses: false,
      pesan: 'Terjadi kesalahan server',
    });
  }
};