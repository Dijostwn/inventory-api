const express = require('express');
const mongoose = require('mongoose'); 
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; 
const ROOT_DIR = path.join(__dirname);

// Koneksi ke MongoDB dengan penanganan error yang lebih baik agar tidak crash
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
    console.error('🛑 MongoDB Error:', err.message);
    // Jangan biarkan proses crash, biarkan server tetap nyala untuk debug
});

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});
// Pastikan mencari di koleksi 'IDPASS' sesuai database kamu
const User = mongoose.model('User', userSchema, 'IDPASS'); 

// --- MIDDLEWARE ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(ROOT_DIR)); 

// --- ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'login.html')));

app.post('/auth-login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Username atau Password Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "DB Error: " + err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
