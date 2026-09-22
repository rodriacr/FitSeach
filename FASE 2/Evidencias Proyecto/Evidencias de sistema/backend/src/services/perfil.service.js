// Lógica de negocio del perfil: datos básicos (FS-HU-02), objetivos y estilo de vida (FS-HU-18) e información de salud (FS-HU-19).
const usuarioModel = require('../models/usuario.model');
const perfilModel = require('../models/perfil.model');
const saludModel = require('../models/salud.model');
const { requerimientoCalorico } = require('./nutricion.service');
const ErrorHttp = require('../utils/ErrorHttp');

const aNumero = (valor) => (valor === null || valor === undefined ? null : Number(valor));
const lista = (valor) => (Array.isArray(valor) ? valor : []);

function formatearPerfil(perfil) {
  const datos = {
    pesoKg: aNumero(perfil?.pesoKg),
    alturaCm: aNumero(perfil?.alturaCm),
    edad: perfil?.edad ?? null,
    sexo: perfil?.sexo ?? null,
    actividadFisica: perfil?.actividadFisica ?? null,
  };
  return {
    perfil: datos,
    completo: Object.values(datos).every((valor) => valor !== null),
    requerimientoCaloricoKcal: requerimientoCalorico(datos),
  };
}

function formatearObjetivos(perfil) {
  return {
    objetivoPrincipal: perfil?.objetivoPrincipal ?? null,
    comidasDia: perfil?.comidasDia ?? null,
    horasSueno: perfil?.horasSueno ?? null,
  };
}

function formatearSalud(salud) {
  if (!salud) return null;
  return {
    condicionesMedicas: lista(salud.condicionesMedicas),
    tomaMedicamentos: salud.tomaMedicamentos,
    medicamentos: lista(salud.medicamentos),
    alergias: lista(salud.alergias),
  };
}

async function obtener(usuarioId) {
  const usuario = await usuarioModel.buscarPorIdConPerfil(usuarioId);
  if (!usuario) {
    throw new ErrorHttp(401, 'La sesión no corresponde a un usuario válido');
  }
  const basico = formatearPerfil(usuario.perfil);
  const objetivos = formatearObjetivos(usuario.perfil);
  const salud = formatearSalud(usuario.informacionSalud);
  return {
    usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol.nombre },
    ...basico,
    objetivos,
    salud,
    // Pasos del asistente de perfil: se muestra mientras alguno esté pendiente.
    pasos: {
      datosPersonales: basico.completo,
      objetivos: Object.values(objetivos).every((valor) => valor !== null),
      salud: salud !== null,
    },
  };
}

async function actualizar(usuarioId, { pesoKg, alturaCm, edad, sexo, actividadFisica }) {
  await perfilModel.guardar(usuarioId, { pesoKg, alturaCm, edad, sexo, actividadFisica });
  return obtener(usuarioId);
}

async function actualizarObjetivos(usuarioId, { objetivoPrincipal, comidasDia, horasSueno }) {
  await perfilModel.guardar(usuarioId, { objetivoPrincipal, comidasDia, horasSueno });
  return obtener(usuarioId);
}

async function actualizarSalud(usuarioId, { condicionesMedicas, tomaMedicamentos, medicamentos, alergias }) {
  await saludModel.guardar(usuarioId, {
    condicionesMedicas,
    tomaMedicamentos,
    medicamentos: tomaMedicamentos ? medicamentos : [],
    alergias,
  });
  return obtener(usuarioId);
}

module.exports = { obtener, actualizar, actualizarObjetivos, actualizarSalud, formatearPerfil };
