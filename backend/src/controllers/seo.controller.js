const seoService = require('../services/seo.service');

async function getConfig(req, res) {
  try {
    const data = await seoService.getPublicConfig(req);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to load SEO config',
    });
  }
}

async function robots(req, res) {
  try {
    const text = await seoService.buildRobotsTxt(req);
    res.type('text/plain').send(text);
  } catch (error) {
    res.status(500).type('text/plain').send('User-agent: *\nDisallow: /\n');
  }
}

async function sitemap(req, res) {
  try {
    const xml = await seoService.buildSitemapXml(req);
    res.type('application/xml').send(xml);
  } catch (error) {
    res.status(500).type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
}

module.exports = {
  getConfig,
  robots,
  sitemap,
};
