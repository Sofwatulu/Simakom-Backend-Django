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
            const ambangBatasOfflineHari = 3; // Batas waktu offline (dalam hari) untuk notifikasi

            let jumlahNotifikasiTerkirim = 0;
            let komputerOfflineTerdeteksi: { kodeKomputer: string; ipAddress: string | null; lastOnline: Date | null }[] = [];

            for (const kom of komputerDaftar) {
                // Hanya periksa jika komputer sedang offline dan memiliki data lastOnline
                if (!kom.online && kom.lastOnline) {
                    const tanggalTerakhirOnline = new Date(kom.lastOnline);
                    const sekarang = new Date();
                    const selisihWaktuMs = Math.abs(sekarang.getTime() - tanggalTerakhirOnline.getTime());
                    const selisihHari = Math.ceil(selisihWaktuMs / (1000 * 60 * 60 * 24)); // Hitung selisih hari

                    if (selisihHari >= ambangBatasOfflineHari) {
                        komputerOfflineTerdeteksi.push(kom);

                        // Siapkan opsi pengiriman email
                        const opsiEmail = {
                            from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
                            to: process.env.EMAIL_USER, // Menggunakan EMAIL_USER sebagai penerima notifikasi default
                            subject: `Peringatan: Komputer ${kom.kodeKomputer} Offline Selama ${selisihHari} Hari`,
                            html: `
                                <p>Yth. Admin,</p>
                                <p>Komputer <strong>${kom.kodeKomputer}</strong> (IP: ${kom.ipAddress || 'N/A'}) telah terdeteksi offline selama <strong>${selisihHari} hari</strong>.</p>
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

                            // TODO (Opsional): Pertimbangkan untuk menambahkan kolom di database (misal: lastNotifikasiTerkirim)
                            // untuk menghindari pengiriman notifikasi berulang untuk kejadian yang sama.
                            // Kemudian update kolom tersebut di sini.

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