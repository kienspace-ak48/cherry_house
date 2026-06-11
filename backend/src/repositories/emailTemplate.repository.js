const prisma = require('../config/prisma.config');

function findAll() {
  return prisma.emailTemplate.findMany({ orderBy: { name: 'asc' } });
}

function findByKey(templateKey) {
  return prisma.emailTemplate.findUnique({ where: { templateKey } });
}

function upsert(data) {
  return prisma.emailTemplate.upsert({
    where: { templateKey: data.templateKey },
    create: data,
    update: {
      name: data.name,
      description: data.description,
      subject: data.subject,
      configJson: data.configJson,
      isEnabled: data.isEnabled,
    },
  });
}

function updateByKey(templateKey, data) {
  return prisma.emailTemplate.update({
    where: { templateKey },
    data,
  });
}

module.exports = {
  findAll,
  findByKey,
  upsert,
  updateByKey,
};
