// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
// Menggunakan port 3000 untuk lokal, atau menggunakan PORT dari environment
const PORT = process.env.PORT || 3000; 

// Nama file database dan lokasi folder publik (root)
const DATA_FILE = path.join(__dirname, 'tickets.json'); 
const PUBLIC_DIR = path.join(__dirname); 

// Middleware untuk memparsing data formulir (application/x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware untuk menyajikan file statis (index.html, success.html, dll.)
app.use(express.static(PUBLIC_DIR)); 

// ----------------------------------------------------------------
// ENDPOINT UNTUK MENERIMA TIKET MASALAH
// ----------------------------------------------------------------
app.post('/kirim-tiket', (req, res) => {
    const dataTiket = req.body;
    
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
            if (fileContent.length > 0) {
                daftarTiket = JSON.parse(fileContent);
            }
        }
    } catch (error) {
        console.error('Error membaca atau parsing tickets.json:', error.message);
        daftarTiket = []; 
    }

    // 2. Tambahkan tiket baru
    daftarTiket.push(newTiket);

    // 3. Tulis kembali ke file tickets.json dan kirim respons
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(daftarTiket, null, 2), 'utf8');
        console.log('Tiket berhasil disimpan ke tickets.json');
        
        // ----------------------------------------------------------------
        // MODIFIKASI: Mengalihkan pengguna ke halaman success.html
        // ----------------------------------------------------------------
        res.redirect('/success.html'); 
        
    } catch (writeError) {
        console.error('Error menulis ke tickets.json:', writeError.message);
        
        // Mengirim respons error jika gagal menyimpan data
        res.status(500).send('<h1>Terjadi Kesalahan Server</h1><p>Gagal menyimpan data tiket. Silakan hubungi admin.</p>');
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server Tiket IT berjalan di http://localhost:${PORT}`);
});
