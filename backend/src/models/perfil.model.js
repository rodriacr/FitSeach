// Acceso a datos de la tabla perfiles_usuario.
const prisma = require('./prisma');

function guardar(usuarioId, datos) {
  return prisma.perfilUsuario.upsert({
    where: { usuarioId },
    create: { usuarioId, ...datos },
    update: datos,
  });
}

module.exports = { guardar };
