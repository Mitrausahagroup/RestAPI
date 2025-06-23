
import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';

import authRoute from './routes/auth.route'
import userRoute from './routes/user.route';
import barangRoute from './routes/barang.route';
import pengambilanRoute from './routes/pengambilan.route'
import penurunanRoute from './routes/penurunan.route'
import pengembalianRoute from './routes/pengembalian.route'


const app = express();
app.use(cors())
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoute)
app.use('/api/users', userRoute );
app.use('/api/barang', barangRoute );
app.use('/api/ambil', pengambilanRoute );
app.use('/api/turun', penurunanRoute );
app.use('/api/balik', pengembalianRoute );


export default app;