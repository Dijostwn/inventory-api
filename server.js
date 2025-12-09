const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000; // Port yang akan digunakan server

// Middleware untuk mem-parsing data application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware untuk menyajikan file statis (seperti index.html)
// Pastikan index.html dan server.js berada di folder yang sama,
// atau sesuaikan path.join() jika Anda menggunakan struktur folder yang berbeda.
app.use(express.static(path.join(__dirname))); 

// Endpoint untuk menerima data formulir
app.post('/kirim-lamaran', (req, res) => {
    const dataLamaran = req.body;
    console.log('Data Lamaran yang Diterima:', dataLamaran);
    
    // --- Lakukan pemrosesan data di sini (misalnya, simpan ke database atau kirim email) ---
    
    // Kirim respons sukses kembali ke klien
    // Jika Anda menggunakan halaman HTML statis, ini akan mengarahkan user kembali ke halaman index
    res.send('<h1>Lamaran berhasil diterima!</h1><p>Terima kasih atas lamaran Anda. Kami akan segera menghubungi Anda.</p><a href="/">Kembali ke halaman utama</a>');
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
