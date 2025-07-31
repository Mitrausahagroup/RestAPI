import { Request, Response } from "express";
import { SalesService } from "../services/sales.service";

const salesService = new SalesService();

export const getAllSales = async (req: Request, res: Response) => {

  try {
    const page = parseInt(req.query.page as string) || 1;
     const limit = parseInt(req.query.limit as string) || 10;

      const sortBy = (req.query.sortBy as string) || 'createdAt';
    const rawSortOrder = req.query.sortOrder as string;
    const sortOrder = rawSortOrder === 'asc' || rawSortOrder === 'desc' ? rawSortOrder : 'desc';

    const sales = await salesService.getAll(page , limit, sortBy, sortOrder)
    res.json({
      success: true,
      data: sales.data,
      total: sales.total,
      totalPage: sales.totalPage,
      currentPage: sales.currentPage,
    });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Gagal mengambil data sales" })
  }
}

export const getSalesById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const sales = await salesService.getById(id)
    if (!sales) {
       res.status(404).json({ message: "Sales tidak ditemukan" })
    }
    res.json(sales)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Gagal mengambil detail sales" })
  }
}

export const createSales = async (req: Request, res: Response) => {
  try {
    const { nama } = req.body
    
    if (!nama) {
       res.status(400).json({ message: "Nama Sales Wajib Di Isi" })
    }
    const newSales = await salesService.create({ nama })
    res.status(201).json(newSales)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Gagal menambahkan sales" })
  }
}

export const updateSales = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { nama } = req.body
    const updated = await salesService.update(id, { nama })
    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Gagal mengupdate sales" })
  }
}

export const deleteSales = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await salesService.delete(id)
    res.json({ message: "Sales berhasil dihapus" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Gagal menghapus sales" })
  }
}