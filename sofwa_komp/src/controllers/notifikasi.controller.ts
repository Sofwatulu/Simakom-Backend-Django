import { Request, Response } from "express";
import prisma from '../config/db';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Konfigurasi transporter email menggunakan variabel lingkungan
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // Ini akan menjadi false untuk port 587 (benar untuk Zoho TLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default {
    async cekOfflineDanNotifikasi(req: Request, res: Response) {
        try {
            const komputerDaftar = await prisma.komputer.findMany();
            // UBAH INI: Batas waktu offline untuk notifikasi menjadi 15 menit
            const ambangBatasOfflineMenit = 15;
            const ambangBatasOfflineMs = ambangBatasOfflineMenit * 60 * 1000; // Konversi ke milidetik

            let jumlahNotifikasiTerkirim = 0;
            let komputerOfflineTerdeteksi: { kodeKomputer: string; ipAddress: string | null; online: boolean; lastPing: Date | null; lastOnline: Date | null }[] = [];


            for (const kom of komputerDaftar) {
                // Hanya periksa jika komputer sedang offline dan memiliki data lastOnline
                // Pastikan lastOnline tidak null untuk perhitungan durasi
                if (!kom.online && kom.lastOnline) {
                    const tanggalTerakhirOnline = new Date(kom.lastOnline);
                    const sekarang = new Date();
                    const selisihWaktuMs = sekarang.getTime() - tanggalTerakhirOnline.getTime(); // Hitung selisih dalam milidetik

                    // UBAH INI: Bandingkan dengan ambang batas menit
                    if (selisihWaktuMs >= ambangBatasOfflineMs) {
                        komputerOfflineTerdeteksi.push(kom);

                        // Siapkan opsi pengiriman email
                        const opsiEmail = {
                            from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
                            to: 'assaidiyah01@gmail.com', // UBAH INI: Alamat email tujuan
                            subject: `Peringatan: Komputer ${kom.kodeKomputer} Offline Selama >${ambangBatasOfflineMenit} Menit`,
                            html: `
                                <p>Yth. Admin,</p>
                                <p>Komputer <strong>${kom.kodeKomputer}</strong> (IP: ${kom.ipAddress || 'N/A'}) telah terdeteksi offline selama lebih dari <strong>${ambangBatasOfflineMenit} menit</strong>.</p>
                                <p>Terakhir online: ${kom.lastOnline?.toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                <p>Mohon segera lakukan pengecekan terhadap komputer tersebut.</p>
                                <p>Terima kasih,</p>
                                <p>Sistem Pemantau Komputer Anda</p>
                            `,
                        };

                        try {
                            await transporter.sendMail(opsiEmail);
                            console.log(`Notifikasi email terkirim untuk ${kom.kodeKomputer}`);
                            jumlahNotifikasiTerkirim++;

                            // TODO (PENTING untuk produksi): Tambahkan kolom `notifikasiTerkirim` (boolean)
                            // atau `lastNotifikasiTerkirimAt` (DateTime) di model Komputer
                            // dan perbarui di sini. Ini akan mencegah email berulang setiap 10 menit
                            // untuk komputer yang sama yang terus offline.
                            // Contoh update:
                            // await prisma.komputer.update({
                            //     where: { id: kom.id },
                            //     data: { notifikasiTerkirim: true, lastNotifikasiTerkirimAt: new Date() }
                            // });

                        } catch (errorEmail) {
                            console.error(`Gagal mengirim email untuk ${kom.kodeKomputer}:`, errorEmail);
                        }
                    }
                }
            }

            res.status(200).json({
                sukses: true,
                pesan: `Pengecekan notifikasi selesai. ${jumlahNotifikasiTerkirim} notifikasi email terkirim.`,
                komputerOffline: komputerOfflineTerdeteksi.map(k => ({ kodeKomputer: k.kodeKomputer, ipAddress: k.ipAddress, lastOnline: k.lastOnline })),
            });

        } catch (error) {
            console.error("Error saat mengecek dan mengirim notifikasi:", error);
            return res.status(500).json({
                sukses: false,
                pesan: "Terjadi Kesalahan Internal Server saat pengecekan notifikasi",
                data: error,
            });
        }
    }
};