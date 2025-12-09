// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'pelamar.json');

// Middleware untuk memparsing data application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware untuk menyajikan file statis (index.html, dll.)
app.use(express.static('public'));

// Rute untuk menampilkan halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rute untuk memproses pengiriman formulir POST
app.post('/submit', (req, res) => {
    const dataPelamar = req.body;
    dataPelamar.tanggalWaktu = new Date().toISOString();

    console.log('Data diterima:', dataPelamar);

    // Baca data yang sudah ada
    let pelamar = [];
    try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        pelamar = JSON.parse(fileContent);
    } catch (error) {
        console.log('File data belum ada atau kosong, membuat array baru.');
    }

    // Tambahkan data baru
    pelamar.push(dataPelamar);

    // Tulis kembali ke file
    fs.writeFileSync(DATA_FILE, JSON.stringify(pelamar, null, 2), 'utf8');

    // Kirim respons sukses
    res.send('<h1>Lamaran berhasil dikirim dan disimpan!</h1><p><a href="/">Kembali ke formulir</a></p>');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
