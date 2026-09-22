const { body } = require('express-validator');
const { usuario } = require('../../../shared/reglas.json');

const correo = () =>
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio').bail()
    .isLength({ max: usuario.correo.max }).withMessage(`El correo no puede superar ${usuario.correo.max} caracteres`).bail()
    .isEmail().withMessage('Ingresa un correo válido')
    .toLowerCase();

const password = (campo) =>
  body(campo)
    .notEmpty().withMessage('La contraseña es obligatoria').bail()
    .isLength({ min: usuario.password.min, max: usuario.password.max })
    .withMessage(`La contraseña debe tener entre ${usuario.password.min} y ${usuario.password.max} caracteres`);

const registro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ min: usuario.nombre.min, max: usuario.nombre.max })
    .withMessage(`El nombre debe tener entre ${usuario.nombre.min} y ${usuario.nombre.max} caracteres`),
  correo(),
  password('password'),
  body('rol').optional().isIn(['usuario', 'profesional']).withMessage('Selecciona un rol válido'),
];

const inicioSesion = [
  correo(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  body('recordar').optional().isBoolean({ strict: true }).withMessage('El valor de "Recordarme" no es válido'),
];

const solicitarRecuperacion = [correo()];

const restablecer = [
  body('token').isString().withMessage('El enlace no es válido').bail()
    .matches(/^[a-f0-9]{64}$/).withMessage('El enlace no es válido o ya venció. Solicita uno nuevo.'),
  password('password'),
];

module.exports = { registro, inicioSesion, solicitarRecuperacion, restablecer };
