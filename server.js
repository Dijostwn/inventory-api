// server.js - FIX 3 (Menghapus Baris Redundant dan Memastikan File Loading)

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000; 
const PUBLIC_DIR = path.join(__dirname);

// --- NAMA FILE CSV (PASTIKAN NAMA INI SAMA PERSIS DI GITHUB) ---
const KARYAWAN_FILE = 'DAFTAR KARYAWAN SYMPHOS 051125.xlsx - Sheet1.csv'; 

// --- KONFIGURASI MONGODB ---
const MONGODB_URI = 'mongodb+srv://jodisetiawan89_db_user:garmin05@cluster0.hzrbv1e.mongodb.net/?appName=Cluster0';

// Definisikan Schema Tiket
const tiketSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    tanggal_waktu: { type: Date, default: Date.now },
    status: { type: String, default: 'Open' },
    nama_pelapor: { type: String, required: true },
    departemen: { type: String, required: true },
    kategori_masalah: { type: String, required: true },
    deskripsi: { type: String, required: true }
});

const Tiket = mongoose.model('Tiket', tiketSchema, 'tickets'); 

// Koneksi ke MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Koneksi ke MongoDB berhasil!'))
    .catch(err => console.error('🛑 Gagal koneksi ke MongoDB:', err.message));


// --- MEMBACA DATA KARYAWAN DARI CSV SAAT SERVER STARTUP ---
const dataKaryawan = [];

// Tambahkan try-catch/if check untuk memastikan file ada
if (fs.existsSync(KARYAWAN_FILE)) {
    fs.createReadStream(KARYAWAN_FILE)
        .pipe(csv())
        .on('data', (data) => {
            if (data.NIKA && data.NAMA) {
                dataKaryawan.push({
                    nika: data.NIKA.trim(),
                    nama: data.NAMA.trim()
                });
            }
        })
        .on('end', () => {
            console.log(`✅ ${dataKaryawan.length} data karyawan berhasil dimuat.`);
        })
        .on('error', (err) => {
             // Jika terjadi error saat membaca (bukan saat membuka)
            console.error('🛑 Error saat memproses CSV:', err.message);
        });
} else {
    // Pesan jika file tidak ditemukan
    console.error(`🛑 FILE TIDAK DITEMUKAN: ${KARYAWAN_FILE}. Pencarian Karyawan tidak akan berfungsi.`);
}
// -----------------------------------------------------------


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR)); 


// --- ENDPOINT UNTUK FRONTEND ---
app.get('/data-karyawan', (req, res) => {
    res.json(dataKaryawan);
});


// --- FIX 404 NOT FOUND ---
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});


// ENDPOINT POST TIKET
app.post('/kirim-tiket', async (req, res) => {
    const dataTiket = req.body;
    
    if (!dataTiket.nama_pelapor) {
        return res.status(400).send('Nama Pelapor wajib diisi.');
    }

    const newTiket = new Tiket({
        id: Date.now(), 
        ...dataTiket 
    });

    try {
        await newTiket.save();
        console.log('Tiket berhasil disimpan ke MongoDB oleh:', newTiket.nama_pelapor);
        res.redirect('/success.html'); 
        
    } catch (dbError) {
        console.error('Error saat menyimpan tiket ke DB:', dbError.message);
        res.status(500).send('<h1>Terjadi Kesalahan Server</h1><p>Gagal menyimpan data tiket ke Database. Cek log server untuk detailnya.</p>');
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server Tiket IT berjalan di http://localhost:${PORT}`);
});
