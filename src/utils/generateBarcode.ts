import bwipjs from 'bwip-js';
const API_FE = process.env.API_URL_VERCEL

export const generateBarcodeImageBuffer = async (id: string) => {
  const url = `${API_FE}/scan/${id}`;

  const qrBuffer = await bwipjs.toBuffer({
    bcid: 'qrcode',          // Jenis barcode
    text: url,               // Data di dalam QR
    scale: 6,
    paddingwidth: 5,
    paddingheight: 5,       // tambahkan ruang di bawah untuk teks
    backgroundcolor: 'FFFFFF',
    includetext: true,
    alttext: 'Mitra Usaha Grup', // ganti teks di bawah QR
    textxalign: 'center',
    textsize: 2,
  });

  return qrBuffer;
};
