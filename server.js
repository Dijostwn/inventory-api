// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
// Menggunakan port dari environment jika tersedia (untuk hosting seperti Render)
const PORT = process.env.PORT || 3000; 
const DATA_FILE = path.join(__dirname, 'pelamar.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR)); // Menyajikan file statis dari folder public

// Pastikan folder public ada
if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`Folder 'public' tidak ditemukan di ${PUBLIC_DIR}. Server mungkin gagal menyajikan index.html.`);
}

// Rute untuk memproses pengiriman formulir POST
app.post('/submit', (req, res) => {
    const dataPelamar = req.body;
    dataPelamar.tanggalWaktu = new Date().toISOString();

    console.log('Data diterima:', dataPelamar);

    let pelamar = [];
    try {
        // Baca data yang sudah ada
        if (fs.existsSync(DATA_FILE)) {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
            pelamar = JSON.parse(fileContent);
        }
    } catch (error) {
        console.error('Error membaca atau parsing pelamar.json:', error.message);
        // Jika gagal parsing, mulai dengan array kosong
        pelamar = []; 
    }

    // Tambahkan data baru
    pelamar.push(dataPelamar);

    try {
        // Tulis kembali ke file
        fs.writeFileSync(DATA_FILE, JSON.stringify(pelamar, null, 2), 'utf8');
        console.log('Data berhasil disimpan ke pelamar.json');
        
        // Kirim respons sukses
        res.send('<h1>Lamaran berhasil dikirim dan data disimpan!</h1><p><a href="/">Kirim lamaran lain</a></p>');
    } catch (writeError) {
        console.error('Error menulis ke pelamar.json:', writeError.message);
        res.status(500).send('<h1>Terjadi Kesalahan Server saat menyimpan data.</h1>');
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
