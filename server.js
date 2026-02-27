// server.js - Versi Final Anti-Error
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; 

// Folder utama adalah tempat file HTML berada
const ROOT_DIR = path.join(__dirname);

// --- KONFIGURASI MONGODB ---
// Saya tambahkan nama database 'helpdesk' agar data tersimpan rapi
const MONGODB_URI = 'mongodb+srv://jodisetiawan89_db_user:garmin05@cluster0.hzrbv1e.mongodb.net/helpdesk?appName=Cluster0';

// Schema Tiket
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

// --- FUNGSI TELEGRAM ---
async function sendTelegramNotification(tiket) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; 
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        console.log('⚠️ Token/ChatID Telegram belum diatur di Environment Variables. Notifikasi dilewati.');
        return;
    }

    const pesan = `
🚀 *TIKET BARU MASUK* 🚀
----------------------------
👤 *Pelapor:* ${tiket.nama_pelapor}
🏢 *Dept:* ${tiket.departemen}
📂 *Kategori:* ${tiket.kategori_masalah}
📝 *Masalah:* ${tiket.deskripsi}
📌 *Status:* ${tiket.status}
----------------------------
`;

    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: pesan,
            parse_mode: 'Markdown'
        });
        console.log('✅ Notifikasi Telegram terkirim!');
    } catch (error) {
        console.error('❌ Gagal kirim Telegram:', error.message);
    }
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(ROOT_DIR)); 

// --- ROUTING ---

// Halaman Utama
app.get('/', (req, res) => {
    res.sendFile(path.join(ROOT_DIR
