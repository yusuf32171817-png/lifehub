const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'requests.json');
const WEBSITES_FILE = path.join(__dirname, 'websites.json');
const IMAGES_FILE = path.join(__dirname, 'images.json');
const VIDEOS_FILE = path.join(__dirname, 'videos.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOAD_DIR));

// إنشاء مجلد الرفع إذا لم يكن موجوداً
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// إعداد multer للرفع
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });

// التأكد من وجود ملف قاعدة البيانات المحلي
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}
if (!fs.existsSync(WEBSITES_FILE)) {
    fs.writeFileSync(WEBSITES_FILE, JSON.stringify([]));
}
if (!fs.existsSync(IMAGES_FILE)) {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify([]));
}
if (!fs.existsSync(VIDEOS_FILE)) {
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify([]));
}

// --- إضافة حيلة الـ Ping لضمان استمرارية السيرفر ---
app.get('/ping', (req, res) => {
    console.log('Keep-alive ping received at:', new Date().toLocaleString());
    res.status(200).send('Server is Awake!');
});
// ----------------------------------------------

app.get('/api/requests', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (e) { res.json([]); }
});

app.get('/api/websites', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(WEBSITES_FILE, 'utf8'));
        res.json(data);
    } catch (e) { res.json([]); }
});

app.get('/api/images', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(IMAGES_FILE, 'utf8'));
        res.json(data);
    } catch (e) { res.json([]); }
});

app.get('/api/videos', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));
        res.json(data);
    } catch (e) { res.json([]); }
});

app.post('/api/requests', (req, res) => {
    try {
        const newRequest = req.body;
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data.push({ id: Date.now(), ...newRequest, date: new Date().toLocaleString() });
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.status(201).json({ message: 'Saved' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.post('/api/websites', upload.array('images', 10), (req, res) => {
    try {
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const newWebsite = {
            name: req.body.name,
            company: req.body.company,
            description: req.body.description,
            url: req.body.url,
            images: images,
            date: new Date().toLocaleString()
        };
        const data = JSON.parse(fs.readFileSync(WEBSITES_FILE, 'utf8'));
        newWebsite.id = Date.now();
        data.push(newWebsite);
        fs.writeFileSync(WEBSITES_FILE, JSON.stringify(data, null, 2));
        res.status(201).json({ message: 'Saved' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.post('/api/images', upload.array('images', 20), (req, res) => {
    try {
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const newImageEntry = {
            id: Date.now(),
            name: req.body.name,
            urls: images, // تخزين مصفوفة روابط الصور
            date: new Date().toLocaleString()
        };
        const data = JSON.parse(fs.readFileSync(IMAGES_FILE, 'utf8'));
        data.push(newImageEntry);
        fs.writeFileSync(IMAGES_FILE, JSON.stringify(data, null, 2));
        res.status(201).json({ message: 'Saved' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.post('/api/videos', upload.single('video'), (req, res) => {
    try {
        const newVideo = {
            name: req.body.name,
            url: req.file ? `/uploads/${req.file.filename}` : req.body.url,
            date: new Date().toLocaleString()
        };
        const data = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));
        newVideo.id = Date.now();
        data.push(newVideo);
        fs.writeFileSync(VIDEOS_FILE, JSON.stringify(data, null, 2));
        res.status(201).json({ message: 'Saved' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.delete('/api/requests/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data = data.filter(item => item.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ message: 'Deleted' });
});

app.delete('/api/websites/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let data = JSON.parse(fs.readFileSync(WEBSITES_FILE, 'utf8'));
    data = data.filter(item => item.id !== id);
    fs.writeFileSync(WEBSITES_FILE, JSON.stringify(data, null, 2));
    res.json({ message: 'Deleted' });
});

app.delete('/api/images/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let data = JSON.parse(fs.readFileSync(IMAGES_FILE, 'utf8'));
    data = data.filter(item => item.id !== id);
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(data, null, 2));
    res.json({ message: 'Deleted' });
});

app.delete('/api/videos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let data = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));
    data = data.filter(item => item.id !== id);
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify(data, null, 2));
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
    console.log(`Server is running at port ${PORT}`);
});