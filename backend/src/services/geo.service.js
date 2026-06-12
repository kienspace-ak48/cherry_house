const prisma = require('../config/prisma.config');
const {
  listProvinces,
  listDestinations,
  listCityOptionsForProperty,
  resolveRegionForCity,
} = require('../data/vietnam-provinces');

async function listCatalogCities() {
  const rows = await prisma.property.findMany({
    where: { isActive: true },
    select: { city: true },
    distinct: ['city'],
    orderBy: { city: 'asc' },
  });
  const fromDb = rows.map((r) => r.city).filter(Boolean);
  if (fromDb.length) return fromDb;

  return listDestinations().map((d) => d.name);
}

function getGeoBundle() {
  return {
    provinces: listProvinces(),
    destinations: listDestinations(),
    propertyCityOptions: listCityOptionsForProperty(),
  };
}

module.exports = {
  listProvinces,
  listDestinations,
  listCityOptionsForProperty,
  listCatalogCities,
  resolveRegionForCity,
  getGeoBundle,
};
