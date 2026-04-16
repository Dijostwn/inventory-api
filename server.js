// server.js - Versi Final Anti-404
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
// Saya tambahkan nama database 'helpdesk' supaya data tersimpan rapi
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

// --- FUNGSI NOTIFIKASI TELEGRAM ---
async function sendTelegramNotification(tiket) {
    const token = '8511447045:AAHcvn1R_1aWWV9I0lT6K8FgB23Sz1GV15Y';
    const chatId = '8511447045';

    if (!token || !chatId) {
        console.log('⚠️ Token/ChatID Telegram tidak ada di Environment Variables. Lewati notifikasi.');
        return;
    }

    const message = `🚨 *TIKET BARU MASUK* 🚨\n\n` +
                    `*Nama:* ${tiket.nama_pelapor}\n` +
                    `*Dept:* ${tiket.departemen}\n` +
                    `*Kategori:* ${tiket.kategori_masalah}\n\n` +
                    `*Deskripsi:* ${tiket.deskripsi}`;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
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
    res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// Jalur manual untuk success.html (Supaya tidak ada lagi "Cannot GET")
app.get('/success.html', (req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'success.html'));
});

// Endpoint POST Tiket
app.post('/kirim-tiket', async (req, res) => {
    try {
        const dataTiket = req.body;
        
        if (!dataTiket.nama_pelapor) {
            return res.status(400).send('Nama Pelapor wajib diisi.');
        }

        const newTiket = new Tiket({
            id: Date.now(), 
            ...dataTiket 
        });

        await newTiket.save();
        console.log('✅ Tiket tersimpan dari:', newTiket.nama_pelapor);
        
        // Kirim telegram (tidak pakai await supaya response user cepat)
        sendTelegramNotification(newTiket);

        // LANGSUNG KIRIM FILE SUCCESS (Anti-Error Redirect)
        res.sendFile(path.join(ROOT_DIR, 'success.html')); 
        
    } catch (dbError) {
        console.error('❌ Error Database:', dbError.message);
        res.status(500).send('<h1>Error</h1><p>Gagal simpan data ke database.</p>');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server jalan di port ${PORT}`);
});
