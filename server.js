// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
// Menggunakan port 3000 untuk lokal, atau menggunakan PORT dari environment (jika deploy)
const PORT = process.env.PORT || 3000; 
// Nama file database (ganti dari pelamar.json)
const DATA_FILE = path.join(__dirname, 'tickets.json'); 
const PUBLIC_DIR = path.join(__dirname); // Asumsi index.html di root folder

// Middleware untuk memparsing data formulir (application/x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware untuk menyajikan file statis (index.html)
app.use(express.static(PUBLIC_DIR)); 

// ----------------------------------------------------------------
// ENDPOINT UNTUK MENERIMA TIKET MASALAH
// ----------------------------------------------------------------
app.post('/kirim-tiket', (req, res) => {
    const dataTiket = req.body;
    
    // Tambahkan timestamp dan ID unik
    const newTiket = {
        id: Date.now(),
        tanggal_waktu: new Date().toISOString(),
        status: 'Open',
        ...dataTiket 
    };

    console.log('Tiket Baru Diterima:', newTiket);

    // 1. Baca data yang sudah ada dari tickets.json
    let daftarTiket = [];
    try {
        if (fs.existsSync(DATA_FILE)) {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
            // Pastikan file tidak kosong sebelum parsing
            if (fileContent.length > 0) {
                daftarTiket = JSON.parse(fileContent);
            }
        }
    } catch (error) {
        console.error('Error membaca atau parsing tickets.json:', error.message);
        // Jika ada error (misal format JSON rusak), mulai dari awal
        daftarTiket = []; 
    }

    // 2. Tambahkan tiket baru
    daftarTiket.push(newTiket);

    // 3. Tulis kembali ke file tickets.json
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(daftarTiket, null, 2), 'utf8');
        console.log('Tiket berhasil disimpan ke tickets.json');
        
        // Kirim respons sukses kembali ke klien
        res.send(`
            <h1>✅ Tiket Berhasil Dibuat!</h1>
            <p>Terima kasih, tiket masalah Anda dengan ID #${newTiket.id} telah dicatat.</p>
            <p>Tim IT akan segera memproses laporan Anda.</p>
            <hr>
            <a href="/">Buat Tiket Baru</a> | 
            <a href="/tickets.json">Lihat Semua Tiket (Raw Data)</a>
        `);
    } catch (writeError) {
        console.error('Error menulis ke tickets.json:', writeError.message);
        res.status(500).send('<h1>Terjadi Kesalahan Server</h1><p>Gagal menyimpan data tiket.</p>');
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server Tiket IT berjalan di http://localhost:${PORT}`);
});
