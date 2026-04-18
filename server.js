const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected'))
    .catch(err => console.error('🛑 DB Error:', err));

const projectSchema = new mongoose.Schema({
    no_order: { type: String, required: true, unique: true },
    // Default diubah jadi string kosong agar tidak langsung berwarna di dashboard
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

app.use(express.json());
// Baris ini penting supaya file static (CSS/JS) terbaca
app.use(express.static(path.join(__dirname))); 

// --- FIX ROUTING ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/update-progress.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'update-progress.html'));
});

// --- API ---
app.post('/auth-login', (req, res) => {
    if (req.body.username === "jodi" && req.body.password === "123") return res.json({ success: true });
    res.status(401).json({ success: false });
});

app.get('/api/projects', async (req, res) => {
    try {
        const data = await Project.find().sort({ no_order: 1 });
        res.json(data);
    } catch (err) { res.json([]); }
});

app.post('/api/update-progress', async (req, res) => {
    try {
        const { no_order, tahap, status } = req.body;
        await Project.findOneAndUpdate(
            { no_order: no_order.toUpperCase().trim() },
            { $set: { [tahap]: status } },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = app;
app.listen(3000);
