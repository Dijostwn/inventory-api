const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Gunakan MONGODB_URI dari env
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(() => console.log('✅ MongoDB Terhubung'))
    .catch(err => console.error('🛑 Gagal Koneksi:', err));

const projectSchema = new mongoose.Schema({
    // Tambahkan trim: true agar tidak ada spasi yang bikin error
    no_order: { type: String, required: true, unique: true, trim: true },
    tank_making: { type: String, default: "" },
    core_making: { type: String, default: "" },
    coil_making: { type: String, default: "" },
    core_coil_assy: { type: String, default: "" },
    connection: { type: String, default: "" },
    final_assy: { type: String, default: "" },
    internal_test: { type: String, default: "" },
    finishing: { type: String, default: "" },
    fat: { type: String, default: "" }
});

const Project = mongoose.model('Project', projectSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/projects', async (req, res) => {
    try {
        const data = await Project.find().sort({ no_order: 1 });
        res.json(data);
    } catch (err) { res.json([]); }
});

app.post('/api/update-progress', async (req, res) => {
    try {
        const { no_order, tahap, status } = req.body;
        
        if (!no_order || !tahap) {
            return res.status(400).json({ success: false, message: "Data tidak lengkap" });
        }

        // Pakai query yang lebih simpel untuk memastikan upsert jalan
        const result = await Project.findOneAndUpdate(
            { no_order: no_order.toUpperCase().trim() },
            { $set: { [tahap]: status } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log("Simpan Berhasil:", result.no_order);
        res.json({ success: true });
    } catch (err) {
        console.error("Error Simpan:", err);
        // Kirim detail error ke frontend biar kita tahu rusaknya di mana
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = app;
app.listen(3000);
