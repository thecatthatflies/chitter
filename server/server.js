require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// serve frontend pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/app/home', (req, res) => res.sendFile(path.join(__dirname, '../public/app/home.html')));
app.get('/app/server/:serverId', (req, res) => res.sendFile(path.join(__dirname, '../public/app/server.html')));
app.get('/app/messages/:userId', (req, res) => res.sendFile(path.join(__dirname, '../public/app/messages.html')));

// 404
app.get('*', (req, res) => res.status(404).send('page not found'));

app.listen(PORT, () => console.log(`chitter frontend server running on port http://localhost:${PORT}`));