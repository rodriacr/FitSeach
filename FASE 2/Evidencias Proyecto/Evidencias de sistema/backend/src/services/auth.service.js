// Lógica de negocio de autenticación: registro, inicio de sesión y emisión de tokens JWT.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const usuarioModel = require('../models/usuario.model');
const ErrorHttp = require('../utils/ErrorHttp');

const MENSAJE_CREDENCIALES = 'Correo o contraseña incorrectos';
// Hash de referencia para comparar cuando el correo no existe y así no revelar, por tiempo de respuesta, si la cuenta existe.
const HASH_FICTICIO = bcrypt.hashSync('contrasena-ficticia-fitsearch', config.bcryptCosto);

function aUsuarioPublico(usuario) {
  return { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol.nombre };
}

// Con "Recordarme" la sesión dura más (DAS, D17).
function firmarToken(usuario, recordar = false) {
  return jwt.sign({ rol: usuario.rol.nombre }, config.jwtSecreto, {
    subject: String(usuario.id),
    expiresIn: recordar ? config.jwtExpiracionRecordar : config.jwtExpiracion,
  });
}

// Solo estos roles se pueden elegir al registrarse; el administrador nunca se crea desde el registro público.
const ROLES_REGISTRO = ['usuario', 'profesional'];

async function registrar({ nombre, correo, password, rol = 'usuario' }) {
  if (!ROLES_REGISTRO.includes(rol)) {
    throw new ErrorHttp(400, 'Los datos enviados no son válidos', { rol: 'Selecciona un rol válido' });
  }
  const existente = await usuarioModel.buscarPorCorreo(correo);
  if (existente) {
    throw new ErrorHttp(409, 'El correo ya está registrado', { correo: 'Ya existe una cuenta con este correo' });
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptCosto);
  let usuario;
  try {
    usuario = await usuarioModel.crearConPerfil({ nombre, correo, passwordHash, rolNombre: rol });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ErrorHttp(409, 'El correo ya está registrado', { correo: 'Ya existe una cuenta con este correo' });
    }
    if (error.code === 'P2025') {
      throw new Error(`No existe el rol "${rol}". Ejecuta "npm run db:seed" para cargar los roles iniciales.`, { cause: error });
    }
    throw error;
  }

  return { token: firmarToken(usuario), usuario: aUsuarioPublico(usuario) };
}

async function iniciarSesion({ correo, password, recordar = false }) {
  const usuario = await usuarioModel.buscarPorCorreo(correo);
  // Las cuentas creadas con Google pueden no tener contraseña: se compara igual para no revelar nada por tiempo de respuesta.
  const coincide = await bcrypt.compare(password, usuario?.passwordHash || HASH_FICTICIO);
  if (!usuario || !usuario.passwordHash || !coincide) {
    throw new ErrorHttp(401, MENSAJE_CREDENCIALES);
  }
  return { token: firmarToken(usuario, recordar), usuario: aUsuarioPublico(usuario) };
}

function verificarToken(token) {
  const datos = jwt.verify(token, config.jwtSecreto);
  return { id: Number(datos.sub), rol: datos.rol };
}

module.exports = { registrar, iniciarSesion, verificarToken, MENSAJE_CREDENCIALES, ROLES_REGISTRO };
