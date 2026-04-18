const express = require('express');
const mongoose = require('mongoose'); 
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; 
const ROOT_DIR = path.join(__dirname);

// Koneksi ke MongoDB dengan Timeout agar tidak buffering selamanya
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('🛑 MongoDB Error:', err.message));

// Schema User - Mengarah ke koleksi IDPASS sesuai database kamu
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema, 'IDPASS');

// Middleware agar req.body tidak kosong
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(ROOT_DIR)); 

// Route Login
app.post('/auth-login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username, password: password });
        if (user) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Username atau Password Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Error: " + err.message });
    }
});

app.get('/', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'login.html')));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
