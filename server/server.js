const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to database', err);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS corners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            imageName TEXT,
            nameEn TEXT,
            nameAr TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cornerId INTEGER,
            nameEn TEXT,
            nameAr TEXT,
            price TEXT,
            FOREIGN KEY(cornerId) REFERENCES corners(id) ON DELETE CASCADE
        )`);
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const upload = multer({ dest: path.join(__dirname, '../images') });

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'IbrahimA.Hamada' && password === 'admin123') {
        res.json({ success: true, token: 'fake-jwt-token-for-demo' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.get('/api/corners', (req, res) => {
    db.all(`SELECT * FROM corners`, [], (err, corners) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.all(`SELECT * FROM items`, [], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });

            const result = corners.map(corner => {
                let cornerItems = items.filter(i => i.cornerId === corner.id);
                return { ...corner, items: cornerItems };
            });

            res.json(result);
        });
    });
});

app.listen(port, () => {
    console.log(`Double Shot Server running at http://localhost:${port}`);
});
