const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; 
const ROOT_DIR = path.join(__dirname);

// 1. Koneksi ke MongoDB dengan opsi stabilitas
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('🛑 MongoDB Error:', err.message));

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});
// Menggunakan koleksi 'IDPASS' sesuai struktur MongoDB Atlas Anda
const User = mongoose.model('User', userSchema, 'IDPASS'); 

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

// --- MIDDLEWARE ---
app.use(express.json()); // Penting agar bisa membaca JSON dari fetch
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(ROOT_DIR)); 

// --- ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'login.html')));
app.get('/tiket.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'tiket.html')));
app.get('/success.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'success.html')));

// Proses Login
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
        
        const message = `🎫 *Tiket IT Baru*\nPelapor: ${req.body.nama_pelapor}\nDept: ${req.body.departemen}`;
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        }).catch(e => console.log("Telegram Error"));

        res.sendFile(path.join(ROOT_DIR, 'success.html'));
    } catch (err) {
        res.status(500).send("Gagal mengirim tiket.");
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
