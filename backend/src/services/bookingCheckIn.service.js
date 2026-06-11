const bookingCheckInRepository = require('../repositories/bookingCheckIn.repository');
const { toSignaturePublicUrl } = require('../utils/bookingSignature.util');

function enrichRecord(row) {
  if (!row) return null;
  return {
    ...row,
    signatureUrl: toSignaturePublicUrl(row.signaturePath),
  };
}

async function getByBookingId(bookingId) {
  const row = await bookingCheckInRepository.findByBookingId(bookingId);
  return enrichRecord(row);
}

async function listGuestHistory({ userId, guestEmail, limit = 20 }) {
  const rows = await bookingCheckInRepository.findForGuest({
    userId,
    guestEmail,
    take: limit,
  });
  return rows.map(enrichRecord);
}

module.exports = {
  getByBookingId,
  listGuestHistory,
};
