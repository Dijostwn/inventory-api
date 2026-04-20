const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('🛑 DB Error:', err));

// TAMBAHKAN KOLOM IDENTITAS DI SINI AGAR BISA DISIMPAN
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

// DAFTAR ADMIN ROLE
const ADMIN_ROLES = {
    "jodi": "superadmin",
    "admin_design": "design_approval",
    "admin_tank": "tank_making",
    "admin_core": "core_making",
    "admin_coil": "coil_making",
    "admin_assy": "core_coil_assy",
    "admin_conn": "connection",
    "admin_final": "final_assy",
    "admin_test": "internal_test",
    "admin_finish": "finishing"
};

app.post('/auth-login', (req, res) => {
    const { username, password } = req.body;
    if (ADMIN_ROLES[username] && password === "123") {
        return res.json({ success: true, role: ADMIN_ROLES[username] });
    }
    res.status(401).json({ success: false });
});

app.post('/api/update-progress', async (req, res) => {
    try {
        const { no_order, customer, project_name, quantity, varian, tahap, status } = req.body;
        let updateData = {};
        
        // Hanya simpan kolom yang ada isinya (mencegah data lama terhapus)
        if (customer) updateData.customer = customer;
        if (project_name) updateData.project_name = project_name;
        if (quantity) updateData.quantity = quantity;
        if (varian) updateData.varian = varian;
        if (tahap && status) updateData[tahap] = status;

        await Project.findOneAndUpdate(
            { no_order: no_order.toUpperCase().trim() },
            { $set: updateData },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/projects', async (req, res) => {
    const data = await Project.find().sort({ no_order: 1 });
    res.json(data);
});

app.delete('/api/projects/:no_order', async (req, res) => {
    await Project.findOneAndDelete({ no_order: req.params.no_order });
    res.json({ success: true });
});

module.exports = app;
app.listen(3000);
