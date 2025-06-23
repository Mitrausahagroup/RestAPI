
import { BarangService } from "../services/barang.service";
import { Request, Response } from "express";

const barangService = new BarangService()

export const fetchBarang = async (req: Request, res: Response) => {
  try {
    const barang = await barangService.getBarang();
    res.status(201).json(barang);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barang' });
  }
};

export const getBarangById = async (req: Request, res: Response) => {
  try {
    const { id } =  req.body
    const barang = barangService.getBarangId(id);
    res.status(201).json(barang);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barang' });
  }
};

export const createBarang = async (req: Request, res: Response) => {
  try {
    const barangData = {
      nama: req.body.name,
      stok: req.body.stok,
      varian: req.body.varian,
    };
    const barang = await barangService.createBarang(barangData)
    res.status(201).json(barang);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateBarang = async (req: Request, res: Response) => {
  try {

    const { id } =  req.body
    const findBarang =  await barangService.getBarangId(id);

    if (!findBarang) {
      res.status(404).json({ error: 'User not found' });
      return
    }
    const barangData = {
      nama: req.body.nama || findBarang.nama ,
      stok: req.body.stok || findBarang.stok,
      varian: req.body.varian || findBarang.varian,
    };
    const barang = await barangService.updateBarang(id ,barangData)
    res.status(201).json(barang);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const removeBarang = async (req: Request, res: Response) => {
  try {
    const { id } =  req.body
    const barang = barangService.deleteBarang(id);
    res.status(201).json(true);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barang' });
  }
};

export const getBarangByVarian = async (req: Request, res: Response) => {
  try {
    const { varian } =  req.body
    const barang = barangService.getBarangByVarian(varian);
    res.status(201).json(barang);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch barang' });
  }
};
