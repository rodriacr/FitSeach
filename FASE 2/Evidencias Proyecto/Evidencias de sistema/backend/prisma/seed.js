// Carga los datos iniciales obligatorios: los roles del sistema.
const { PrismaClient } = require('@prisma/client');
const { roles } = require('../../shared/reglas.json');

const prisma = new PrismaClient();

async function main() {
  for (const nombre of roles) {
    await prisma.rol.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  console.log(`Roles cargados: ${roles.join(', ')}`);
}

main()
  .catch((error) => {
    console.error('Error al cargar los datos iniciales:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
