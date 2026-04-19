const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('🛑 MongoDB Connection Error:', err));

const projectSchema = new mongoose.Schema({
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

// ROUTING
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/auth-login', (req, res) => {
    const { username, password } = req.body;
    if (username === "jodi" && password === "123") {
        return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: "Login Gagal" });
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
