const geoService = require('../services/geo.service');
const { sendApiError } = require('../utils/http');

async function provinces(req, res) {
  try {
    res.json({ success: true, data: geoService.listProvinces() });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function destinations(req, res) {
  try {
    res.json({ success: true, data: geoService.listDestinations() });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function catalogCities(req, res) {
  try {
    const data = await geoService.listCatalogCities();
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function bundle(req, res) {
  try {
    const catalogCities = await geoService.listCatalogCities();
    res.json({
      success: true,
      data: {
        ...geoService.getGeoBundle(),
        catalogCities,
      },
    });
  } catch (error) {
    sendApiError(res, error);
  }
}

module.exports = {
  provinces,
  destinations,
  catalogCities,
  bundle,
};
