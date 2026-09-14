// Reúne los errores de express-validator en una respuesta 400 con el detalle por campo.
const { validationResult } = require('express-validator');
const ErrorHttp = require('../utils/ErrorHttp');

function validar(req, res, next) {
  const errores = validationResult(req);
  if (errores.isEmpty()) {
    return next();
  }
  const detalles = {};
  for (const error of errores.array({ onlyFirstError: true })) {
    detalles[error.path] = error.msg;
  }
  return next(new ErrorHttp(400, 'Hay campos incompletos o inválidos', detalles));
}

module.exports = validar;
