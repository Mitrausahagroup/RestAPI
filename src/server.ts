
import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import path from 'path';


import authRoute from './routes/auth.route'
import userRoute from './routes/user.route';
import salesRoute from './routes/sales.route'
import tokoRoute from './routes/toko.route'
import barcodeRoute from './routes/barcode.route'
import barangRoute from './routes/barang.route';
import pengambilanRoute from './routes/pengambilan.route'
import penurunanRoute from './routes/penurunan.route'
import pengembalianRoute from './routes/pengembalian.route'
import exportRoute from './routes/export.route'


const app = express();
app.use(cors({
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoute)
app.use('/api/users', userRoute );
app.use('/api/sales', salesRoute );
app.use('/api/barang', barangRoute );
app.use('/api/barcode', barcodeRoute)
app.use('/api/toko', tokoRoute )

app.use('/api/pengambilan', pengambilanRoute)
app.use('/api/pengembalian', pengembalianRoute)
app.use('/api/pengiriman', penurunanRoute)
app.use('/api/export', exportRoute)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


export default app;