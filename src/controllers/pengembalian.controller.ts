import { Request, Response } from 'express';
import { PengembalianService } from '../services/pengembalian.service';
import { uploadCompressedImage } from '../utils/uploadImage';
import prisma from '../utils/prisma';
import path from 'path';
import fs from 'fs';

const pengembalianService = new PengembalianService();


export const createPengembalian = async (req: Request, res: Response) => {
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

    let items: { barangId: string; jumlah: number; kondisi:'BAIK' | 'RUSAK' }[] = [];

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
    

    // Handle optional photo upload
    let fotoUrl = '';
    if (file) {
      fotoUrl = await uploadCompressedImage(file.buffer,  {
        prefix: "pengiriman",
        salesName: findSales?.nama
      });
    }

    // Optional userId from JWT if available
    const userId = res.locals.jwt?.id;

    const result = await pengembalianService.createPengembalian({
      userId,
      salesId,
      fotoUrl,
      items,
    });

    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error: any) {
    console.error('Create error:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      error: error.message || 'Gagal membuat pengembalian' 
    });
  }
};

export const getAllPengembalian = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

     const sortBy = (req.query.sortBy as string) || 'createdAt';
    const rawSortOrder = req.query.sortOrder as string;
    const sortOrder = rawSortOrder === 'asc' || rawSortOrder === 'desc' ? rawSortOrder : 'desc';

    
    const result = await pengembalianService.getAll(page, limit, sortBy, sortOrder);
    
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error: any) {
    console.error('Get all error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Gagal mengambil data pengembalian' 
    });
  }
};

export const getPengembalianById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pengembalianService.getById(id);
    
    if (!result) {
       res.status(404).json({
        success: false,
        error: 'Data pengembalian tidak ditemukan'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get by ID error:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      error: error.message || 'Gagal mengambil data pengembalian' 
    });
  }
};

export const updatePengembalian = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { salesId, items } = req.body;
    
    const findSales = await prisma.sales.findFirst({ where: { id: salesId } });

    const existing = await pengembalianService.getById(id);
    
        if (!existing) {
          res.status(404).json({
            sukses: false,
            pesan: 'Data pengambilan tidak ditemukan'
          });
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

        const file = req.file;

    let fotoUrl: string | null = existing!.data.fotoUrl;
   if (file) {
         if (existing!.data.fotoUrl) {
           const oldPath = path.join(__dirname, '../../uploads/', existing!.data.fotoUrl);
           if (fs.existsSync(oldPath)) {
             fs.unlinkSync(oldPath);
           }
         }
   
         fotoUrl = await uploadCompressedImage(file.buffer, {
           prefix: 'pengambilan',
         });
       }

    // Optional userId from JWT if available
    const userId = res.locals.jwt?.id;

    const result = await pengembalianService.updatePengembalian(id, {
      userId,
      fotoUrl: fotoUrl!,
      items: parsedItems
    });

    res.status(200).json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error: any) {
    console.error('Update error:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      error: error.message || 'Gagal memperbarui pengembalian' 
    });
  }
};

export const deletePengembalian = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pengembalianService.removePengembalian(id);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Pengembalian berhasil dihapus'
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      error: error.message || 'Gagal menghapus pengembalian' 
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
    const result = await pengembalianService.getDailyPengembalianSummary(date);

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