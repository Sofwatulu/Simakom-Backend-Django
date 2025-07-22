// src/app.ts
import express from 'express';
import komputer from './routes/komputer';
import notifikasi from './routes/notifikasi';

const app = express();

app.use(express.json());
app.use('/komputer', komputer);
app.use('/notifikasi', notifikasi);

export default app;