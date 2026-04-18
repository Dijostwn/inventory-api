const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Pastikan MONGODB_URI di Vercel sudah pakai /weltraf
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('🛑 DB Error:', err));

const projectSchema = new mongoose.Schema({
    no_order: { type: String, required: true, unique: true },
    tank_making: { type: String, default: "Pending (Merah)" },
    core_making: { type: String, default: "Pending (Merah)" },
    coil_making: { type: String, default: "Pending (Merah)" },
    core_coil_assy: { type: String, default: "Pending (Merah)" },
    connection: { type: String, default: "Pending (Merah)" },
    final_assy: { type: String, default: "Pending (Merah)" },
    internal_test: { type: String, default: "Pending (Merah)" },
    finishing: { type: String, default: "Pending (Merah)" },
    fat: { type: String, default: "Pending (Merah)" }
});
const Project = mongoose.model('Project', projectSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

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
        // Logic $set: Hanya update kolom yang dipilih (tahap), yang lain tetap.
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
