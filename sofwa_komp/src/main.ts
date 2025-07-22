import app from './app';
import cron from 'node-cron'; // Import node-cron
import komputerController from './controllers/komputer.controller'; // Import controller komputer
import notifikasiController from './controllers/notifikasi.controller'; // Import controller notifikasi

const PORT = 3000; // Ambil PORT dari .env atau default 3000

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);

  // --- Penjadwalan Otomatis ---

  // 1. Jadwalkan fungsi ping setiap 1 jam
  // Cron string: '0 * * * *' berarti pada menit ke-0 setiap jam
  cron.schedule('*/10 * * * *', async () => {
    console.log('Menjalankan pengecekan ping terjadwal...');
    // Panggil fungsi ping dari controller komputer
    // Kita berikan objek kosong untuk req dan res karena ini dipanggil secara internal, bukan dari HTTP request
    await komputerController.ping({} as any, {} as any);
    console.log('Pengecekan ping terjadwal selesai.');
  }, {
    // scheduled: true, // Hapus baris ini 
    timezone: "Asia/Jakarta" // Sesuaikan dengan zona waktu Anda
  });

  // 2. Jadwalkan pengecekan notifikasi setiap 3 hari sekali
  // Cron string: '0 8 */3 * *' berarti pada menit ke-0, jam 08:00 pagi, setiap 3 hari
  cron.schedule('*/10 * * * *', async () => {
    console.log('Menjalankan pengecekan notifikasi offline terjadwal...');
    // Panggil fungsi cekOfflineDanNotifikasi dari controller notifikasi
    await notifikasiController.cekOfflineDanNotifikasi({} as any, {} as any);
    console.log('Pengecekan notifikasi offline terjadwal selesai.');
  }, {
    // scheduled: true, // Hapus baris ini 
    timezone: "Asia/Jakarta" // Sesuaikan dengan zona waktu Anda
  });

});

//'*/10 * * * *'
//'*/10 * * * *'

//'0 * * * *'
//'0 8 */3 * *'
