const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Gunakan link MongoDB kamu
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('🛑 DB Error:', err));

app.use(express.json());
// Baris ini sangat penting agar Vercel bisa membaca folder saat ini
app.use(express.static(path.join(__dirname))); 

// Route manual agar tidak "Cannot GET"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ... kode route API kamu lainnya ...

module.exports = app;

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
const Project = mongoose.model('Project', projectSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname))); // Fix path static

// 2. FIX "CANNOT GET" - Navigasi Manual
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/update-progress.html', (req, res) => res.sendFile(path.join(__dirname, 'update-progress.html')));

// 3. API
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
            { no_order: no_order.trim() },
            { $set: { [tahap]: status } },
            { upsert: true }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = app;
app.listen(3000);
