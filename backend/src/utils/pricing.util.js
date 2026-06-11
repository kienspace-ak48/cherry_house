const promoCodeService = require('../services/promoCode.service');

/**
 * @param {number} roomPriceVnd
 * @param {number} nights
 * @param {string | null | undefined} promoCodeInput
 */
async function calculateBookingPricing(roomPriceVnd, nights, promoCodeInput) {
  const pricePerNightVnd = Math.round(roomPriceVnd);
  const nightCount = Math.max(1, Math.round(nights));
  const subtotalVnd = pricePerNightVnd * nightCount;
  const serviceFeeVnd = 0;

  const promoRaw = typeof promoCodeInput === 'string' ? promoCodeInput.trim() : '';
  if (!promoRaw) {
    return {
      pricePerNightVnd,
      nights: nightCount,
      subtotalVnd,
      serviceFeeVnd,
      discountVnd: 0,
      totalVnd: subtotalVnd,
      promoCode: null,
      promo: null,
    };
  }

  const promo = await promoCodeService.validateAndApply(promoRaw, subtotalVnd);
  return {
    pricePerNightVnd,
    nights: nightCount,
    subtotalVnd,
    serviceFeeVnd,
    discountVnd: promo.discountVnd,
    totalVnd: promo.totalVnd,
    promoCode: promo.code,
    promo,
  };
}

module.exports = { calculateBookingPricing };
