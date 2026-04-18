const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; 
const ROOT_DIR = path.join(__dirname);

// 1. Koneksi ke MongoDB menggunakan Environment Variable dari Vercel
// Ganti bagian koneksi mongoose di server.js Anda dengan ini
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Tunggu 5 detik sebelum timeout
    socketTimeoutMS: 45000,         // Tutup soket setelah 45 detik
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('🛑 MongoDB Error:', err.message));

// --- SCHEMAS ---

// Skema untuk Tiket
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

// Skema untuk User (Login)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});
// PENTING: Menggunakan koleksi 'IDPASS' sesuai gambar MongoDB Anda
const User = mongoose.model('User', userSchema, 'IDPASS'); 

// --- MIDDLEWARE ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Untuk memproses data JSON dari fetch di index.html
app.use(express.static(ROOT_DIR)); 

// --- ROUTES ---

// Rute untuk menampilkan halaman HTML
app.get('/', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'login.html')));
app.get('/tiket.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'tiket.html')));
app.get('/success.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'success.html')));

// Proses Login: Mengecek ke koleksi IDPASS
app.post('/auth-login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username, password: password });
        if (user) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Username atau Password Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Error Server: " + err.message });
    }
});

// Proses Kirim Tiket
app.post('/kirim-tiket', async (req, res) => {
    try {
        const newTiket = new Tiket({ id: Date.now(), ...req.body });
        await newTiket.save();
        
        // Notifikasi Telegram (Pastikan Environment Variables sudah diisi di Vercel)
        const message = `🎫 *Tiket IT Baru*\nPelapor: ${req.body.nama_pelapor}\nDept: ${req.body.departemen}`;
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        }).catch(e => console.log("Telegram Notification Error"));

        res.sendFile(path.join(ROOT_DIR, 'success.html'));
    } catch (err) {
        res.status(500).send("Gagal mengirim tiket.");
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
