// Verifica el token JWT de la cabecera Authorization y el rol del usuario.
const { verificarToken } = require('../services/auth.service');
const ErrorHttp = require('../utils/ErrorHttp');

function autenticar(req, res, next) {
  const [esquema, token] = (req.headers.authorization || '').split(' ');
  if (esquema !== 'Bearer' || !token) {
    return next(new ErrorHttp(401, 'Debes iniciar sesión'));
  }
  try {
    req.usuario = verificarToken(token);
    return next();
  } catch {
    return next(new ErrorHttp(401, 'La sesión es inválida o expiró. Inicia sesión nuevamente'));
  }
}

function autorizarRoles(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return next(new ErrorHttp(403, 'No tienes permisos para realizar esta acción'));
    }
    return next();
  };
}

module.exports = { autenticar, autorizarRoles };
