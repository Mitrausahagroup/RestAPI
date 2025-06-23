import { Request, Response } from "express";
import { PenurunanService } from "../services/penurunan.service";
import { uploadCompressedImage } from "../utils/uploadImage";
import fs from "fs";
import path from "path";

const penurunanService = new PenurunanService();

export const deletePenurunan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await penurunanService.removePenurunan(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus data" });
  }
};


export const getAllPenurunan = async (_: Request, res: Response) => {
  try {
    const result = await penurunanService.getAllPenurunan();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data" });
  }
};

export const getPenurunanById = async (req: Request, res: Response) => {
  try {

    const {id} = req.params

    const result = await penurunanService.getPenurunanById(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data" });
  }
};


export const createPenurunan = async (req: Request, res: Response) => {
  try {
    const { toko, latitude, longitude, items } = JSON.parse(req.body.data);

    const file = req.file;

    const userId =  res.locals.jwt.id

    if (!file) {
        res.status(400).json({ message: "Foto wajib diunggah" });
    } 

    const fotoUrl = await uploadCompressedImage(file!.buffer);

    const result = await penurunanService.createPenurunan({
      userId,
      toko,
      latitude,
      longitude,
      fotoUrl,
      items,
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error("Create error:", err);
    res.status(500).json({ message: err.message });
  }
};


export const updatePenurunan = async (req: Request, res: Response) => {
  try {
    const { toko, latitude, longitude, items } = JSON.parse(req.body.data);
    const file = req.file;

    const userId =  res.locals.jwt.id

    let fotoUrl: string | undefined;

    if (file) {
      fotoUrl = await uploadCompressedImage(file.buffer);
    }

    const result = await penurunanService.updatePenurunan(req.params.id, {
      userId,
      toko,
      latitude,
      longitude,
      fotoUrl,
      items,
    });

    res.json(result);
  } catch (err: any) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
};