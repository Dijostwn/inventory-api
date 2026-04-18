const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected'));

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
app.use(express.static(__dirname));

app.post('/auth-login', (req, res) => {
    if (req.body.username === "jodi" && req.body.password === "123") return res.json({ success: true });
    res.status(401).json({ success: false });
});

app.get('/api/projects', async (req, res) => {
    const data = await Project.find().sort({ no_order: 1 });
    res.json(data);
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
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = app;
app.listen(3000);
