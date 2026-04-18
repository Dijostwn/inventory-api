const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// KONEKSI DB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('🛑 MongoDB Error:', err));

// SCHEMA
const projectSchema = new mongoose.Schema({
    no_order: { type: String, required: true, unique: true },
    tank_making: { type: String, default: "Pending" },
    core_making: { type: String, default: "Pending" },
    coil_making: { type: String, default: "Pending" },
    core_coil_assy: { type: String, default: "Pending" },
    connection: { type: String, default: "Pending" },
    final_assy: { type: String, default: "Pending" },
    internal_test: { type: String, default: "Pending" },
    finishing: { type: String, default: "Pending" },
    fat: { type: String, default: "Pending" }
});
const Project = mongoose.model('Project', projectSchema, 'projects');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ROUTES HALAMAN
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/update-progress.html', (req, res) => res.sendFile(path.join(__dirname, 'update-progress.html')));

// API AMBIL DATA
app.get('/api/projects', async (req, res) => {
    try {
        const data = await Project.find().sort({ no_order: 1 });
        res.json(data);
    } catch (err) {
        res.status(500).json([]);
    }
});

// API UPDATE DATA (FIXED)
app.post('/api/update-progress', async (req, res) => {
    const { no_order, tahap, status } = req.body;
    try {
        await Project.findOneAndUpdate(
            { no_order: no_order.trim() }, 
            { $set: { [tahap]: status } }, 
            { upsert: true, new: true }
        );
        // Respon wajib dikirim agar frontend tahu proses selesai
        res.status(200).json({ success: true, message: "Update Berhasil" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

module.exports = app;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
