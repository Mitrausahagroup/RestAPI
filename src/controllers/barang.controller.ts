
import { BarangService } from "../services/barang.service";
import { Request, Response } from "express";

const barangService = new BarangService()

export const fetchBarang = async (req: Request, res: Response) => {
  try {

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const rawSortOrder = req.query.sortOrder as string;
    const sortOrder = rawSortOrder === 'asc' || rawSortOrder === 'desc' ? rawSortOrder : 'desc';

    const barang = await barangService.getBarang(page, limit, sortBy, sortOrder);
     res.json({
      success: true,
      data: barang.data,
      total: barang.total,
      totalPage: barang.totalPage,
      currentPage: barang.currentPage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barang' });
  }
};

export const getBarangById = async (req: Request, res: Response) => {
  try {
    const { id } =  req.params
    const barang = await barangService.getBarangId(id);
    res.status(201).json(barang);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barang' });
  }
};

export const createBarang = async (req: Request, res: Response) => {
  try {
    const barangData = {
      nama: req.body.nama,
      stok: parseInt(req.body.stok),
      varian: req.body.varian,
    };
    const barang = await barangService.createBarang(barangData)
    res.status(201).json(barang);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create barang' });
  }
};

export const updateBarang = async (req: Request, res: Response) => {
  try {

    const { id } =  req.params
    const findBarang =  await barangService.getBarangId(id);

    if (!findBarang) {
      res.status(404).json({ error: 'Barang not found' });
      return
    }
    const barangData = {
      nama: req.body.nama || findBarang.nama ,
      stok: parseInt(req.body.stok) || findBarang.stok,
      varian: req.body.varian || findBarang.varian,
    };
    const barang = await barangService.updateBarang(id ,barangData)
    res.status(201).json(barang);
  } catch (error) {

    res.status(500).json({ error: 'Failed to update barang' });
  }
};

export const removeBarang = async (req: Request, res: Response) => {
  try {
    const { id } =  req.params
    const barang = await barangService.deleteBarang(id);
    res.status(201).json(true);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove barang' });
  }
};

export const getBarangByVarian = async (req: Request, res: Response) => {
  try {
    const { varian } =  req.params

     if (varian !== 'HALUS' && varian !== 'KASAR') {
      res.status(400).json({ error: 'Varian tidak valid, harus HALUS atau KASAR' });
    }

    const barang = await barangService.getBarangByVarian(varian as 'HALUS' | 'KASAR');
    res.status(201).json(barang);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barang' });
  }
};
