const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'requests.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.get('/api/requests', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (e) { res.json([]); }
});

app.post('/api/requests', (req, res) => {
    const newRequest = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data.push({ id: Date.now(), ...newRequest, date: new Date().toLocaleString() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.status(201).json({ message: 'Saved' });
});

app.delete('/api/requests/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data = data.filter(item => item.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ message: 'Deleted' });
});

app.delete('/api/requests', (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    res.json({ message: 'Cleared' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
