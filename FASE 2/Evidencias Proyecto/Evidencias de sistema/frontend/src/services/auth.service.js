import { solicitar } from './api.js';

export function registrar({ nombre, correo, password, rol }) {
  return solicitar('/auth/registro', { metodo: 'POST', cuerpo: { nombre, correo, password, rol }, conSesion: false });
}

export function iniciarSesion({ correo, password, recordar = false }) {
  return solicitar('/auth/login', { metodo: 'POST', cuerpo: { correo, password, recordar }, conSesion: false });
}

export function cerrarSesion() {
  return solicitar('/auth/logout', { metodo: 'POST' });
}

export function solicitarRecuperacion({ correo }) {
  return solicitar('/auth/recuperar', { metodo: 'POST', cuerpo: { correo }, conSesion: false });
}

export function restablecerPassword({ token, password }) {
  return solicitar('/auth/restablecer', { metodo: 'POST', cuerpo: { token, password }, conSesion: false });
}
