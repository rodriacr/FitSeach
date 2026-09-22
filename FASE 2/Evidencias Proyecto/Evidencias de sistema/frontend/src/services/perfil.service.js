import { solicitar } from './api.js';

export function obtenerPerfil() {
  return solicitar('/perfil');
}

export function actualizarPerfil(datos) {
  return solicitar('/perfil', { metodo: 'PUT', cuerpo: datos });
}

export function actualizarObjetivos(datos) {
  return solicitar('/perfil/objetivos', { metodo: 'PUT', cuerpo: datos });
}

export function actualizarSalud(datos) {
  return solicitar('/perfil/salud', { metodo: 'PUT', cuerpo: datos });
}
