import { Request, Response } from "express";
import { PenurunanService } from "../services/penurunan.service";
import { uploadCompressedImage } from "../utils/uploadImage";
import prisma from "../utils/prisma";
import path from "path";
import fs from "fs";

const penurunanService = new PenurunanService();

interface PenurunanItem {
  barangId: string;
  jumlah: number;
}

interface CreatePenurunanRequest {
  userId?: string;
  tokoId: string;
  salesId: string;
  fotoUrl?: string;
  items: PenurunanItem[];
}

interface UpdatePenurunanRequest {
  userId?: string;
  tokoId: string;
  salesId?: string;
  fotoUrl?: string;
  items?: PenurunanItem[];
}

export const deletePenurunan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await penurunanService.removePenurunan(id);
    
    res.status(200).json({
      success: true,
      data: result,
      message: "Penurunan berhasil dihapus"
    });
  } catch (err: any) {
    console.error("Delete error:", err);
    
    const statusCode = err.message.includes("tidak ditemukan") ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      error: err.message || "Gagal menghapus data penurunan" 
    });
  }
};

export const getAllPenurunan = async (req: Request, res: Response) => {
  try {

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

     const sortBy = (req.query.sortBy as string) || 'createdAt';
    const rawSortOrder = req.query.sortOrder as string;
    const sortOrder = rawSortOrder === 'asc' || rawSortOrder === 'desc' ? rawSortOrder : 'desc';
    
    const result = await penurunanService.getAllPenurunan(page, limit, sortBy, sortOrder);
    
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (err: any) {
    console.error("Get all error:", err);
    res.status(500).json({ 
      success: false,
      error: err.message || "Gagal mengambil data penurunan" 
    });
  }
};

export const getPenurunanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await penurunanService.getPenurunanById(id);
    
    if (!result.success) {
       res.status(404).json({
        success: false,
        error: "Data penurunan tidak ditemukan"
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (err: any) {
    console.error("Get by ID error:", err);
    
    const statusCode = err.message.includes("tidak ditemukan") ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      error: err.message || "Gagal mengambil data penurunan" 
    });
  }
};

export const createPenurunan = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { salesId, tokoId } = req.body; 

     const findSales = await prisma.sales.findFirst({
      where: {id :salesId}
    })

     const findtoko = await prisma.toko.findFirst({
      where: {id :tokoId}
    })


    if (!findSales) {
      res.status(404).json({
        sukses: false,
        pesan: 'Sales tidak ditemukan'
      });
    }
    if (!findtoko) {
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

    // Handle optional photo upload
    let fotoUrl = ""
    if (file) {
      fotoUrl = await uploadCompressedImage(file.buffer,  {
        prefix: "pengiriman",
        salesName: findSales?.nama
      });
    }


    const result = await penurunanService.createPenurunan({
      salesId,
      tokoId,
      fotoUrl,
      items,
    });

    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (err: any) {
    console.error("Create error:", err);
    
    const statusCode = err.message.includes("tidak ditemukan") ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      error: err.message || "Gagal membuat penurunan" 
    });
  }
};

export const updatePenurunan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { salesId, tokoId, items } = req.body;

    const existing = await penurunanService.getPenurunanById(id);

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
    

    let fotoUrl: string | null =  existing.data!.fotoUrl;

     if (req.file) {
          if (existing.data!.fotoUrl) {
            const oldPath = path.join(__dirname, '../../uploads/', existing.data!.fotoUrl);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
    
          fotoUrl = await uploadCompressedImage(req.file.buffer, {
            prefix: 'penngiriman',
          });
        }

    // Optional userId from JWT if available
    const userId = res.locals.jwt?.id;

    const result = await penurunanService.updatePenurunan(id, {
      userId,
      salesId: salesId,
      tokoId: tokoId,
      fotoUrl: fotoUrl!,
      items: parsedItems,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (err: any) {
    console.error("Update error:", err);
    
    const statusCode = err.message.includes("tidak ditemukan") ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      error: err.message || "Gagal memperbarui penurunan" 
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
    const result = await penurunanService.getDailyDeliverySummary(date);

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