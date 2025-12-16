// server.js - Versi Bersih (MongoDB & Telegram Notification)

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const path = require('path');
const axios = require('axios'); // Module untuk request HTTP

const app = express();
const PORT = process.env.PORT || 3000; 
const PUBLIC_DIR = path.join(__dirname);

// --- KONFIGURASI MONGODB ---
// MONGODB_URI dari input Anda:
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


// --- FUNGSI BARU: MENGIRIM NOTIFIKASI TELEGRAM ---
async function sendTelegramNotification(tiket) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.error('🛑 Gagal mengirim Telegram: Environment Variables TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID tidak ditemukan.');
        return;
    }

    // Format Pesan menggunakan Markdown
    const message = `🚨 *TIKET BARU MASUK (IT Helpdesk)* 🚨\n\n` +
                    `*Nama Pelapor:* ${tiket.nama_pelapor}\n` +
                    `*Departemen:* ${tiket.departemen}\n` +
                    `*Kategori Masalah:* ${tiket.kategori_masalah}\n\n` +
                    `*Deskripsi:*\n${tiket.deskripsi}`;

    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
        const response = await axios.post(telegramUrl, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown' // Menggunakan Markdown untuk bold (*)
        });
        console.log('✅ Notifikasi Telegram berhasil dikirim.');
    } catch (error) {
        // Log error yang detail dari Telegram
        console.error('❌ Gagal mengirim notifikasi Telegram:', error.response ? error.response.data : error.message);
    }
}
// -----------------------------------------------------------


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR)); 


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
        
        // --- Panggil fungsi notifikasi Telegram di sini ---
        sendTelegramNotification(newTiket); // <--- BARIS KRITIS!
        // ----------------------------------------------------

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
