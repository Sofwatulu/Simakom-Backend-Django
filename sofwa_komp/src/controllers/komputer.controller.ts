import { Request, Response } from "express";
import prisma from '../config/db';
import ping from 'ping';

export default {
    async ping(req: Request, res: Response) {
        try {
            const daftarKomputer = await prisma.komputer.findMany(); // Mengubah nama variabel menjadi Bahasa Indonesia

            if (daftarKomputer.length === 0) {
                console.log("Tidak ada komputer ditemukan di database untuk di-ping.");
                return res.status(200).json({
                    success: true,
                    message: "Tidak ada komputer ditemukan untuk di-ping.",
                    data: [],
                });
            }

            console.log(`Memulai proses ping untuk ${daftarKomputer.length} komputer...`);

            for (let i = 0; i < daftarKomputer.length; i++) {
                const kom = daftarKomputer[i];

                if (!kom.ipAddress) {
                    console.warn(`Peringatan: Komputer ${kom.kodeKomputer} tidak memiliki IP Address. Melewatkan ping.`);
                    continue; // Lanjutkan ke komputer berikutnya jika IP Address kosong
                }

                try {
                    const hasilPing = await ping.promise.probe(kom.ipAddress as string); // Mengubah nama variabel menjadi Bahasa Indonesia

                    await prisma.komputer.update({
                        where: { kodeKomputer: kom.kodeKomputer },
                        data: {
                            online: hasilPing.alive,
                            lastPing: new Date(),
                            lastOnline: hasilPing.alive ? new Date() : kom.lastOnline
                        }
                    });
                    console.log(`Ping ${kom.kodeKomputer} (${kom.ipAddress}): ${hasilPing.alive ? 'Online' : 'Offline'}`); // Logging lebih deskriptif
                } catch (pingError) {
                    console.error(`Gagal melakukan ping untuk ${kom.kodeKomputer} (${kom.ipAddress}):`, pingError);
                    // Opsi: Anda bisa update status komputer menjadi offline jika ping gagal
                    await prisma.komputer.update({
                        where: { kodeKomputer: kom.kodeKomputer },
                        data: {
                            online: false, // Set offline jika ada error ping
                            lastPing: new Date(),
                            // lastOnline tetap seperti sebelumnya atau set null jika ingin menandakan tidak pernah online
                        }
                    });
                }
            }

            // Ambil data terbaru setelah ping selesai untuk respons
            const komputerTerupdate = await prisma.komputer.findMany();

            res.status(200).json({
                success: true,
                message: "Pembaruan status komputer selesai.",
                data: komputerTerupdate, // Mengembalikan data yang sudah terupdate
            });
        } catch (error) {
            console.error("Terjadi Error pada fungsi ping di komputer.controller:", error); // Logging error yang lebih baik
            return res.status(500).json({
                success: false,
                message: "Terjadi Kesalahan Internal Server saat menjalankan proses ping.",
                data: error,
            });
        }
    },

    // --- Fungsi Baru: Mendapatkan Status Komputer (untuk Django) ---
    async getStatusKomputer(req: Request, res: Response) {
        try {
            // Ambil semua data komputer dari database tanpa melakukan ping
            const statusKomputer = await prisma.komputer.findMany({
                select: { // Pilih kolom yang ingin Anda kembalikan
                    id: true,
                    kodeKomputer: true,
                    ipAddress: true,
                    online: true,
                    lastPing: true,
                    lastOnline: true,
                }
            });

            return res.status(200).json({
                success: true,
                message: "Data status komputer berhasil didapatkan.",
                data: statusKomputer,
            });
        } catch (error) {
            console.error("Error saat mendapatkan status komputer dari database:", error); // Logging error yang lebih baik
            return res.status(500).json({
                success: false,
                message: "Terjadi Kesalahan Internal Server saat mendapatkan status komputer.",
                data: error,
            });
        }
    }
};