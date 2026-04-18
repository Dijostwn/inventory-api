const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. KONEKSI DATABASE
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('🛑 MongoDB Error:', err));

// 2. SCHEMA PROJECT TRAFO
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

// 3. MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // Melayani file html, css, js di folder yang sama

// 4. ROUTES UNTUK HALAMAN (Fix Cannot GET)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/update-progress.html', (req, res) => res.sendFile(path.join(__dirname, 'update-progress.html')));

// 5. API ENDPOINTS
app.get('/api/projects', async (req, res) => {
    try {
        const data = await Project.find().sort({ no_order: 1 });
        res.json(data);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.post('/api/update-progress', async (req, res) => {
    const { no_order, tahap, status } = req.body;
    try {
        await Project.findOneAndUpdate(
            { no_order }, 
            { [tahap]: status }, 
            { upsert: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// LOGIN AUTH (Simpel menggunakan data statis atau database IDPASS)
app.post('/auth-login', (req, res) => {
    const { username, password } = req.body;
    if(username === "jodi" && password === "123") {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Login Gagal" });
    }
});

module.exports = app; // Penting untuk Vercel
app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
