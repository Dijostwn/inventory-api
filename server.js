const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; 
const ROOT_DIR = path.join(__dirname);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('🛑 MongoDB Error:', err.message));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(ROOT_DIR)); 

// --- ROUTES ---
// Pastikan semua file .html didaftarkan di sini
app.get('/', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'login.html')));
app.get('/tiket.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'tiket.html')));
app.get('/success.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'success.html')));

app.post('/kirim-tiket', async (req, res) => {
    try {
        const newTiket = new Tiket({ id: Date.now(), ...req.body });
        await newTiket.save();
        
        const message = `🎫 *Tiket IT Baru*\nPelapor: ${req.body.nama_pelapor}\nDept: ${req.body.departemen}`;
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        res.sendFile(path.join(ROOT_DIR, 'success.html'));
    } catch (err) {
        res.status(500).send("Gagal mengirim tiket.");
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
