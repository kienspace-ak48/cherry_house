const { httpError, isDbConnectionError } = require('./http');

function mapPrismaError(error, notFoundMessage = 'Record not found') {
  if (isDbConnectionError(error)) {
    throw httpError('Không kết nối được MySQL. Hãy bật MySQL Server (Workbench/service) rồi thử lại.', 503);
  }
  if (error?.code === 'P2025') throw httpError(notFoundMessage, 404);
  if (error?.code === 'P2002') throw httpError('Duplicate unique field', 409);
  if (error?.code === 'P2003') throw httpError('Related record not found', 404);
  throw error;
}

module.exports = { mapPrismaError };
