// server.js (MODIFIKASI)

// ... (kode import dan setup middleware lainnya tetap sama) ...

// Endpoint untuk menerima data formulir
// GANTI /kirim-lamaran menjadi /kirim-tiket
app.post('/kirim-tiket', (req, res) => { 
    const dataTiket = req.body; // Ganti nama variabel
    console.log('Tiket Masalah IT Diterima:', dataTiket); // Pesan log baru
    
    // --- Di sini Anda akan menyimpan dataTiket ke file JSON atau database ---
    
    // Kirim respons sukses kembali ke klien
    res.send('<h1>Tiket Berhasil Dibuat!</h1><p>Tim IT akan segera memproses laporan Anda. Terima kasih.</p><a href="/">Buat Tiket Baru</a>');
});

// ... (kode app.listen) ...
