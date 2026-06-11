/**
 * Smoke test analytics export — node scripts/test-analytics-export.js
 */
require('dotenv').config({ path: require('../src/config/myPath.config').ENV_PATH });
const fs = require('fs');
const path = require('path');
const { exportAnalyticsBuffer } = require('../src/modules/analyticsExport/analyticsExport.service');

async function main() {
  const query = { from: '2026-05-01', to: '2026-06-30' };
  const admin = { role: 'admin' };

  const { buffer, filename } = await exportAnalyticsBuffer(query, admin);
  const outDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, Buffer.from(buffer));

  const ExcelJS = require('exceljs');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(outPath);

  const sheetNames = wb.worksheets.map((s) => s.name);
  const expected = [
    'Tong_quan',
    'Bookings',
    'Thanh_toan',
    'Cong_suat',
    'Check_in',
    'Khach_hang',
    'Ma_khuyen_mai',
    'Lien_he',
    'Huong_dan',
  ];

  console.log('File:', outPath);
  console.log('Size:', buffer.byteLength, 'bytes');
  console.log('Sheets:', sheetNames.join(', '));

  for (const name of expected) {
    if (!sheetNames.includes(name)) {
      throw new Error(`Missing sheet: ${name}`);
    }
  }

  const bookingsSheet = wb.getWorksheet('Bookings');
  console.log('Bookings rows (incl. header):', bookingsSheet.rowCount);

  const staffScoped = await exportAnalyticsBuffer(
    { from: '2026-05-01', to: '2026-06-30', branchId: '1' },
    { role: 'staff', branchId: 1, propertyId: 1 },
  );
  console.log('Staff export OK, size:', staffScoped.buffer.byteLength);

  const partial = await exportAnalyticsBuffer(
    { from: '2026-05-01', to: '2026-05-31', sheets: ['bookings', 'thanh_toan'] },
    admin,
  );
  const partialWb = new ExcelJS.Workbook();
  await partialWb.xlsx.load(Buffer.from(partial.buffer));
  const partialNames = partialWb.worksheets.map((s) => s.name);
  if (!partialNames.includes('Bookings') || !partialNames.includes('Thanh_toan')) {
    throw new Error('Partial export missing expected sheets');
  }
  if (partialNames.includes('Tong_quan')) {
    throw new Error('Partial export should not include Tong_quan');
  }
  console.log('Partial export sheets:', partialNames.join(', '));

  console.log('OK — analytics export smoke test passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
