// server.js - Versi Final (MongoDB, Fix 404, dan Pencarian Karyawan)

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser'); // Diperlukan untuk membaca CSV

const app = express();
const PORT = process.env.PORT || 3000; 
const PUBLIC_DIR = path.join(__dirname);
const KARYAWAN_FILE = 'DAFTAR KARYAWAN SYMPHOS 051125.xlsx - Sheet1.csv'; 

// GANTI DENGAN PASSWORD ASLI ANDA
const MONGODB_URI = 'mongodb+srv://jodisetiawan89_db_user:garmin05@cluster0.hzrbv1e.mongodb.net/?appName=Cluster0';

// Definisikan Schema Tiket (Struktur Data)
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
fs.createReadStream(KARYAWAN_FILE)
  .pipe(csv())
  .on('data', (data) => {
    // Memformat data menjadi NIKA dan NAMA
    // Asumsi header CSV adalah NO, NIKA, NAMA
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
    console.error('🛑 Gagal membaca file CSV:', err.message);
  });
// -----------------------------------------------------------


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR)); 


// --- ENDPOINT UNTUK FRONTEND (Pencarian Karyawan) ---
app.get('/data-karyawan', (req, res) => {
    // Mengirimkan array data karyawan yang sudah dimuat
    res.json(dataKaryawan);
});


// --- FIX 404 NOT FOUND ---
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});


// ENDPOINT UNTUK MENERIMA TIKET MASALAH
app.post('/kirim-tiket', async (req, res) => {
    const dataTiket = req.body;
    
    // Pastikan nama_pelapor yang dikirim adalah nama, bukan NIKA
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
