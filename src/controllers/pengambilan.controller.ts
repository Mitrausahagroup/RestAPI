import { PengambilanService } from "../services/pengambilan.service";
import { Request, Response } from "express";
import { uploadCompressedImage } from '../utils/uploadImage';
import path from "path";
import fs from 'fs';

const ambilService = new PengambilanService()

export const getAllambils = async (req: Request, res: Response) => {
  try {
    const pengambilan = await ambilService.getAll();
    res.status(201).json(pengambilan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pengambilan' });
  }
};

export const getPengambilanByStatus = async (req: Request, res: Response) => {
  try {
    const { status } =  req.params

     if (!['PENDING', 'DISETUJUI', 'DITOLAK'].includes(status)) {
     res.status(404).json({ error: 'Status tidak valid' })
  }

    const pengambilan = ambilService.getByStatus(status as 'PENDING' | 'DISETUJUI' | 'DITOLAK');
    res.status(201).json(pengambilan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pengambilan' });
  }
};

export const createPengambilan = async (req: Request, res: Response) => {
  try {
    const { userId, items } = JSON.parse(req.body.data);
    const file = req.file;

    if (!file) {
     res.status(400).json({ error: 'Foto tidak ditemukan' }); 
    }
   let fotoUrl = ''
    if (file) {
      fotoUrl = await uploadCompressedImage(file.buffer); 
    }
    const result = await ambilService.createPengambilan({
      userId,
      fotoUrl,
      items,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: 'Gagal membuat pengambilan' });
  }
};

export const updateStatusPengambilan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['DISETUJUI', 'DITOLAK'].includes(status)) {
       res.status(400).json({ error: 'Status tidak valid' });
    }

    const result = await ambilService.updateStatus(id, status);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


export const updatePengambilan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, items } = JSON.parse(req.body.data);
    const file = req.file;

     const existing = await ambilService.getById(id);

    if (!existing) {
      res.status(404).json({ error: 'Data tidak ditemukan' });
    }

    let fotoUrl: string | undefined = existing!.fotoUrl;

    if (file) {

      if (existing!.fotoUrl) {
        const oldPath = path.join(__dirname, '../../uploads/', existing!.fotoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }


      fotoUrl = await uploadCompressedImage(file.buffer); 
    }

    const result = await ambilService.updatePengambilan(id, {
      userId,
      fotoUrl,
      items,
    });

    res.status(200).json(result);
  } catch (err: any) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const removePengambilan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params 

    const existing = await ambilService.getById(id);

    if (!existing) {
      res.status(404).json({ error: 'Pengambilan tidak ditemukan' });
    }

    const transaksi = await ambilService.removePengambilan(id);
    

    if (existing!.fotoUrl) {
          const filePath = path.join(__dirname, '../../uploads/', existing!.fotoUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      res.status(201).json(transaksi); 
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaksi' });
  }
};