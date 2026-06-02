import { BRANCH_MAP_PINS } from '../data/branchMapPins';
import { formatPriceFrom } from '../data/properties';

/**
 * @param {BranchMapPin} pin
 */
export function googleMapsEmbedUrl(pin) {
  if (pin.embedUrl) return pin.embedUrl;
  const z = pin.zoom ?? 15;
  const q = encodeURIComponent(`${pin.lat},${pin.lng}`);
  return `https://maps.google.com/maps?q=${q}&hl=vi&z=${z}&output=embed`;
}

/**
 * @param {{ id: string; address: string; name: string }} branch
 * @param {string} [city]
 * @returns {import('../data/branchMapPins').BranchMapPin}
 */
export function resolveBranchMapPin(branch, city = '') {
  const saved = BRANCH_MAP_PINS[branch.id];
  if (saved) return saved;

  const query = encodeURIComponent(`${branch.address}${city ? `, ${city}` : ''}`);
  return {
    lat: 0,
    lng: 0,
    zoom: 14,
    label: branch.name,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
  };
}

/**
 * @param {Array<{ id: string } & Record<string, unknown>>} branches
 * @param {string} [city]
 */
export function resolveBranchMapPins(branches, city) {
  return branches.map((b) => ({
    branch: b,
    pin: resolveBranchMapPin(b, city),
  }));
}

/**
 * @param {import('../data/branchMapPins').BranchMapPin[]} pins
 */
export function averageMapCenter(pins) {
  const valid = pins.filter((p) => p.lat && p.lng);
  if (valid.length === 0) return { lat: 11.94, lng: 108.44, zoom: 13 };
  const lat = valid.reduce((s, p) => s + p.lat, 0) / valid.length;
  const lng = valid.reduce((s, p) => s + p.lng, 0) / valid.length;
  return { lat, lng, zoom: valid.length > 1 ? 13 : (valid[0].zoom ?? 15) };
}

/**
 * @param {{ priceFromVnd?: number; tagline?: string }} branch
 * @param {import('../data/branchMapPins').BranchMapPin} pin
 * @param {number} [propertyPriceFrom]
 */
export function resolvePinDisplay(branch, pin, propertyPriceFrom) {
  const price = branch.priceFromVnd ?? propertyPriceFrom ?? 0;
  return {
    badge: pin.pinBadge ?? formatPriceFrom(price),
    info: pin.pinInfo ?? branch.tagline ?? '',
    priceLabel: formatPriceFrom(price),
  };
}
