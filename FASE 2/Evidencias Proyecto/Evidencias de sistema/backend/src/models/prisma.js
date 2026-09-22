// Instancia única del cliente de Prisma para toda la aplicación.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
