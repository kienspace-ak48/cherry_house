const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('../src/generated/prisma');
const { createMariaDbAdapter } = require('../src/config/mariadb.config');

const prisma = new PrismaClient({ adapter: createMariaDbAdapter() });

/**
 * Xóa dữ liệu nghiệp vụ + catalog trước khi seed lại.
 * Giữ schema, migrations, room_types, amenities, users/admins (seed upsert sau).
 */
async function resetSeedData(client = prisma) {
  console.log('Đang reset dữ liệu (payments → bookings → catalog…)…');

  await client.walletTransaction.deleteMany();
  await client.bookingRefund.deleteMany();
  await client.userWallet.deleteMany();
  await client.payment.deleteMany();
  await client.booking.deleteMany();
  await client.contactMessage.deleteMany();
  await client.refreshToken.deleteMany();
  await client.registrationOtp.deleteMany();

  await client.mediaImage.deleteMany();
  await client.mediaFolder.deleteMany();

  await client.roomTypeAmenity.deleteMany();
  await client.propertyAmenity.deleteMany();
  await client.propertyGallery.deleteMany();
  await client.inventoryRoom.deleteMany();
  await client.branchMapPin.deleteMany();
  await client.branch.deleteMany();
  const { count } = await client.property.deleteMany();

  console.log(`Reset xong — đã xóa ${count} cơ sở và dữ liệu liên quan.`);
  return count;
}

async function main() {
  await resetSeedData();
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { resetSeedData };
