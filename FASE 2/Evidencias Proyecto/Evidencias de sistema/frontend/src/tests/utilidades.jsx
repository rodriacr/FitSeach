import { render } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { SesionProvider } from '../context/SesionContext.jsx';

// Igual que main.jsx: StrictMode repite los efectos y detecta los que no son seguros.
export function renderizarApp(rutaInicial = '/') {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[rutaInicial]}>
        <SesionProvider>
          <App />
        </SesionProvider>
      </MemoryRouter>
    </StrictMode>,
  );
}

export function respuestaJson(estado, cuerpo) {
  return Promise.resolve(new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  }));
}

export const SESION = {
  token: 'token-de-prueba',
  usuario: { id: 1, nombre: 'Ana Pérez', correo: 'ana@correo.cl', rol: 'usuario' },
};

// Respuesta de GET /api/perfil con la forma completa (pasos del asistente incluidos).
export function respuestaPerfil({ perfil = {}, objetivos = {}, salud = null, requerimientoCaloricoKcal = null, usuario = SESION.usuario } = {}) {
  const basico = { pesoKg: null, alturaCm: null, edad: null, sexo: null, actividadFisica: null, ...perfil };
  const metas = { objetivoPrincipal: null, comidasDia: null, horasSueno: null, ...objetivos };
  const completo = Object.values(basico).every((valor) => valor !== null);
  return {
    usuario, perfil: basico, completo, requerimientoCaloricoKcal, objetivos: metas, salud,
    pasos: { datosPersonales: completo, objetivos: Object.values(metas).every((valor) => valor !== null), salud: salud !== null },
  };
}

export const PERFIL_COMPLETO = {
  perfil: { pesoKg: 70, alturaCm: 175, edad: 30, sexo: 'masculino', actividadFisica: 'moderada' },
  objetivos: { objetivoPrincipal: 'bajar_peso', comidasDia: 3, horasSueno: '7_8' },
  salud: { condicionesMedicas: ['hipertension'], tomaMedicamentos: true, medicamentos: ['presion'], alergias: ['ninguna'] },
  requerimientoCaloricoKcal: 2556,
};
