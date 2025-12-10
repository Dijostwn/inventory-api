// server.js - Versi MongoDB

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // <--- IMPORT MOONGOSE
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; 
const PUBLIC_DIR = path.join(__dirname);

// --- KONFIGURASI MONGODB ---
// GANTI DENGAN CONNECTION STRING DARI MONGODB ATLAS ANDA
const MONGODB_URI = 'mongodb+srv://jodisetiawan89_db_user:<db_password>@cluster0.hzrbv1e.mongodb.net/?appName=Cluster0';

// 1. Definisikan Schema Tiket (Struktur Data)
const tiketSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    tanggal_waktu: { type: Date, default: Date.now },
    status: { type: String, default: 'Open' },
    nama_pelapor: { type: String, required: true },
    departemen: { type: String, required: true },
    kategori_masalah: { type: String, required: true },
    deskripsi: { type: String, required: true }
});

// 2. Buat Model MongoDB
const Tiket = mongoose.model('Tiket', tiketSchema, 'tickets'); // 'tickets' adalah nama collection di DB

// Koneksi ke MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Koneksi ke MongoDB berhasil!'))
    .catch(err => console.error('🛑 Gagal koneksi ke MongoDB:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR)); 

// Pastikan root path ('/') selalu melayani index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// ----------------------

// ENDPOINT KIRIM TIKET
app.post('/kirim-tiket', async (req, res) => { // Fungsi harus ASYNC
    const dataTiket = req.body;
    
    // Buat objek tiket baru untuk disimpan di DB
    const newTiket = new Tiket({
        id: Date.now(), // Gunakan timestamp sebagai ID
        ...dataTiket 
    });

    console.log('Tiket Baru Diterima:', newTiket);

    try {
        // 3. Simpan Tiket ke MongoDB
        await newTiket.save(); // Menggunakan fungsi save() dari Mongoose
        console.log('Tiket berhasil disimpan ke MongoDB');
        
        // Kirim Respons Redirect ke success.html
        res.redirect('/success.html'); 
        
    } catch (dbError) {
        console.error('Error saat menyimpan tiket ke DB:', dbError.message);
        
        // Mengirim respons error jika gagal menyimpan data
        res.status(500).send('<h1>Terjadi Kesalahan Server</h1><p>Gagal menyimpan data tiket ke Database.</p>');
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server Tiket IT berjalan di http://localhost:${PORT}`);
});
