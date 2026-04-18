const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('🛑 MongoDB Error:', err));

// --- SCHEMA PROJECT TRAFO ---
const projectSchema = new mongoose.Schema({
    no_order: { type: String, required: true, unique: true },
    customer: String,
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

// API: Ambil semua project
app.get('/api/projects', async (req, res) => {
    const data = await Project.find().sort({ no_order: 1 });
    res.json(data);
});

// API: Update progress per tahap
app.post('/api/update-progress', async (req, res) => {
    const { no_order, tahap, status } = req.body;
    try {
        await Project.findOneAndUpdate(
            { no_order }, 
            { [tahap]: status }, 
            { upsert: true } // Jika no_order belum ada, akan dibuat baru
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
