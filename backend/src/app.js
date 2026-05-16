const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');

const { CLIENT_DIST_PATH } = require('./config/myPath.config');
const registerRoutes = require('./routes');

// middlwares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

// routes — API first
registerRoutes(app);

/* React production build (vite → CLIENT_DIST_PATH) + client-side routing */
app.use(express.static(CLIENT_DIST_PATH));

app.use((req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
        return next();
    }
    if (req.path.startsWith('/api')) {
        res.status(404).json({ success: false, message: 'Route not found' });
        return;
    }
    const indexHtml = path.join(CLIENT_DIST_PATH, 'index.html');
    res.sendFile(indexHtml, (err) => {
        if (err) next(err);
    });
});

app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;