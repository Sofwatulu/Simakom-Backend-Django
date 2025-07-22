import { Router } from 'express';
import notifikasiController from '../controllers/notifikasi.controller'; // Import controller yang sudah diganti nama

const router = Router();

router.get('/cek-notifikasi-offline', notifikasiController.cekOfflineDanNotifikasi);

export default router;