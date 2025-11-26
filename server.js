// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors()); 
app.use(bodyParser.json());

// Data Disimpan di Memori Server (Simulasi Database)
let inventory = [
    { id: 1, name: "Monitor 24in", quantity: 12 },
    { id: 2, name: "Keyboard Mekanik", quantity: 30 }
];
let nextId = 3;

// 1. READ (GET)
app.get('/api/items', (req, res) => {
    res.json(inventory);
});

// 2. CREATE (POST)
app.post('/api/items', (req, res) => {
    if (!req.body.name || req.body.quantity === undefined) {
        return res.status(400).send("Nama dan Kuantitas diperlukan.");
    }
    const newItem = { id: nextId++, name: req.body.name, quantity: parseInt(req.body.quantity) };
    inventory.push(newItem);
    res.status(201).json(newItem);
});

// 3. DELETE
app.delete('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = inventory.length;
    inventory = inventory.filter(item => item.id !== id);
    if (inventory.length < initialLength) {
        res.status(200).send({ message: 'Item berhasil dihapus' });
    } else {
        res.status(404).send({ message: 'Item tidak ditemukan' });
    }
});

app.listen(PORT, () => {
    console.log(`Server API berjalan di port ${PORT}`);
});
