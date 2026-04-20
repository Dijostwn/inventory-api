const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('🛑 DB Error:', err));

// SCHEMA DIPERBAIKI: Menambahkan kolom identitas agar bisa disimpan
const projectSchema = new mongoose.Schema({
    no_order: { type: String, required: true, unique: true, trim: true },
    customer: { type: String, default: "" },
    project_name: { type: String, default: "" },
    quantity: { type: String, default: "" },
    varian: { type: String, default: "" },
    design_approval: { type: String, default: "" },
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
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/update-progress.html', (req, res) => res.sendFile(path.join(__dirname, 'update-progress.html')));

app.post('/auth-login', (req, res) => {
    // Tambahkan pengembalian 'role' agar frontend tahu ini Superadmin
    if (req.body.username === "jodi" && req.body.password === "123") {
        return res.json({ success: true, role: 'superadmin' });
    }
    res.status(401).json({ success: false });
});

app.get('/api/projects', async (req, res) => {
    try {
        const data = await Project.find().sort({ no_order: 1 });
        res.json(data);
    } catch (err) { res.json([]); }
});

// FUNGSI UPDATE DIPERBAIKI: Bisa menerima semua kolom
app.post('/api/update-progress', async (req, res) => {
    try {
        const { no_order, customer, project_name, quantity, varian, tahap, status } = req.body;
        
        let updateData = {};
        if (customer) updateData.customer = customer;
        if (project_name) updateData.project_name = project_name;
        if (quantity) updateData.quantity = quantity;
        if (varian) updateData.varian = varian;
        
        // Update tahap produksi jika dipilih
        if (tahap && status) {
            updateData[tahap] = status;
        }

        await Project.findOneAndUpdate(
            { no_order: no_order.toUpperCase().trim() },
            { $set: updateData },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ success: false }); 
    }
});

app.delete('/api/projects/:no_order', async (req, res) => {
    try {
        await Project.findOneAndDelete({ no_order: req.params.no_order });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = app;
app.listen(3000);
