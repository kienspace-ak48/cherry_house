const fs = require('fs');
const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');

const { CLIENT_DIST_PATH, PUBLIC_PATH, VIEWS_PATH } = require('./config/myPath.config');
const registerRoutes = require('./routes');
const seoService = require('./services/seo.service');
const { applySeoPlaceholders } = require('./utils/spaSeoHtml.util');

let cachedIndexHtml = null;
let cachedIndexMtimeMs = 0;

async function loadSpaIndexHtml() {
  const indexPath = path.join(CLIENT_DIST_PATH, 'index.html');
  const stat = await fs.promises.stat(indexPath);
  if (!cachedIndexHtml || stat.mtimeMs !== cachedIndexMtimeMs) {
    cachedIndexHtml = await fs.promises.readFile(indexPath, 'utf8');
    cachedIndexMtimeMs = stat.mtimeMs;
  }
  return cachedIndexHtml;
}

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

/* Static assets — TRƯỚC routes để /staff/css không bị staffAuth redirect */
app.use('/coreui', express.static(path.join(PUBLIC_PATH, 'coreui')));
app.use('/admin/css', express.static(path.join(PUBLIC_PATH, 'admin', 'css')));
app.use('/admin/js', express.static(path.join(PUBLIC_PATH, 'admin', 'js')));
app.use('/staff/css', express.static(path.join(PUBLIC_PATH, 'staff', 'css')));
app.use('/staff/js', express.static(path.join(PUBLIC_PATH, 'staff', 'js')));
app.use('/uploads', express.static(path.join(PUBLIC_PATH, 'uploads')));
app.use('/favicon', express.static(path.join(PUBLIC_PATH, 'favicon')));

// routes — API + admin EJS pages
registerRoutes(app);

/*
 * Static React assets — index: false để GET / không trả thẳng index.html
 * (phải đi qua SPA handler bên dưới để inject SEO cho crawler Zalo/FB).
 */
app.use(express.static(PUBLIC_PATH, { index: false, fallthrough: true }));
app.use(express.static(CLIENT_DIST_PATH, { index: false, fallthrough: true }));

function shouldHandleSpaDocument(req) {
    if (!['GET', 'HEAD'].includes(req.method)) return false;
    if (req.path.startsWith('/api')) return false;
    if (
        req.path.startsWith('/admin')
        || req.path.startsWith('/staff')
        || req.path.startsWith('/coreui')
        || req.path.startsWith('/auth')
        || req.path === '/robots.txt'
        || req.path === '/sitemap.xml'
    ) {
        return false;
    }
    if (path.extname(req.path)) return false;
    return true;
}

/** HTML shell + thay __PLACEHOLDER__ từ DB (crawler). React PageSeo cập nhật khi user navigate. */
async function sendSpaDocument(req, res, next) {
    try {
        const [html, meta] = await Promise.all([
            loadSpaIndexHtml(),
            seoService.resolveSpaMeta(req),
        ]);
        const body = applySeoPlaceholders(html, meta);
        res.type('html');
        if (req.method === 'HEAD') {
            res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'));
            return res.end();
        }
        return res.send(body);
    } catch (err) {
        return next(err);
    }
}

app.use((req, res, next) => {
    if (!shouldHandleSpaDocument(req)) return next();
    return sendSpaDocument(req, res, next);
});

app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
