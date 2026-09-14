const config = require('./config/env');
const app = require('./app');
const prisma = require('./models/prisma');

const servidor = app.listen(config.puerto, () => {
  console.log(`API de FitSearch escuchando en http://localhost:${config.puerto}/api`);
});

async function detener() {
  servidor.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', detener);
process.on('SIGTERM', detener);
