const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');

const { CLIENT_DIST_PATH, PUBLIC_PATH, VIEWS_PATH } = require('./config/myPath.config');
const registerRoutes = require('./routes');

/* View engine — EJS + express-ejs-layouts */
app.set('view engine', 'ejs');
app.set('views', VIEWS_PATH);
app.use(expressLayouts);
app.set('layout', 'layouts/adminLayoutCoreui');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// middlwares — Nginx/reverse proxy: req.protocol, X-Forwarded-* đúng cho OAuth redirect
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// routes — API + admin EJS pages
registerRoutes(app);

/* Static assets */
app.use('/coreui', express.static(path.join(PUBLIC_PATH, 'coreui')));
app.use('/admin/css', express.static(path.join(PUBLIC_PATH, 'admin', 'css')));
app.use('/admin/js', express.static(path.join(PUBLIC_PATH, 'admin', 'js')));
app.use('/uploads', express.static(path.join(PUBLIC_PATH, 'uploads')));
app.use('/favicon', express.static(path.join(PUBLIC_PATH, 'favicon')));

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
    if (
        req.path.startsWith('/admin')
        || req.path.startsWith('/coreui')
        || req.path.startsWith('/auth')
        || req.path === '/robots.txt'
        || req.path === '/sitemap.xml'
    ) {
        return next();
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
