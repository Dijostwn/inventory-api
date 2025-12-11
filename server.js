// server.js - Versi Final WAN (Fix 404 dan MongoDB)

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const path = require('path');

const app = express();
// Gunakan process.env.PORT yang disediakan oleh Railway, atau default 3000
const PORT = process.env.PORT || 3000; 
const PUBLIC_DIR = path.join(__dirname);

// --- KONFIGURASI MONGODB ---
// GANTI <db_password> DENGAN PASSWORD ASLI ANDA
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

// Buat Model MongoDB
const Tiket = mongoose.model('Tiket', tiketSchema, 'tickets'); 

// Koneksi ke MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Koneksi ke MongoDB berhasil!'))
    .catch(err => console.error('🛑 Gagal koneksi ke MongoDB:', err.message));


// Middleware untuk memparsing data formulir
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware untuk menyajikan file statis (CSS, index.html, success.html)
app.use(express.static(PUBLIC_DIR)); 


// --- FIX 404 NOT FOUND ---
// Route eksplisit untuk memastikan root path ('/') selalu melayani index.html
app.get('/', (req, res) => {
    // Mengirim file index.html dari direktori saat ini
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});
// -------------------------


// ENDPOINT UNTUK MENERIMA TIKET MASALAH
app.post('/kirim-tiket', async (req, res) => {
    const dataTiket = req.body;
    
    const newTiket = new Tiket({
        id: Date.now(), 
        ...dataTiket 
    });

    console.log('Tiket Baru Diterima:', newTiket);

    try {
        // Simpan Tiket ke MongoDB
        await newTiket.save();
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
