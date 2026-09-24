import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { renderizarApp, respuestaJson } from '../tests/utilidades.jsx';
import { render } from '@testing-library/react';
import KinesiologosGoogle from '../components/KinesiologosGoogle.jsx';

test('Google Maps se carga solo al buscar una zona y queda identificado como externo', async () => {
  render(<KinesiologosGoogle />);
  expect(screen.queryByTitle(/Google Maps/)).not.toBeInTheDocument();
  await userEvent.type(screen.getByLabelText('Comuna o ciudad'), 'Melipilla, Chile');
  await userEvent.click(screen.getByRole('button', { name: 'Buscar en Google Maps' }));
  expect(screen.getByTitle('Kinesiólogos en Melipilla, Chile — Google Maps')).toHaveAttribute('src', expect.stringContaining('Melipilla%2C%20Chile'));
  expect(screen.getByRole('link', { name: /Ver kinesiólogos/ })).toHaveAttribute('href', expect.stringContaining('api=1&query='));
  expect(screen.getByText(/no indican que estén registrados en FitSearch/)).toBeInTheDocument();
});

const ficha = { id: 1, nombre: 'Ana Demo', especialidad: 'Nutrición', descripcion: 'Atención nutricional', ubicacionLat: -33.686, ubicacionLng: -71.215, establecimiento: { nombre: 'Consulta Demo', direccion: 'Melipilla' } };
function simular(listado = () => ({ profesionales: [ficha], pagina: 1, hayMas: false })) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation((url) => respuestaJson(200,
    url.includes('/especialidades') ? { especialidades: ['Nutrición', 'Kinesiología'] } : listado(url)));
}
test('muestra nombre, especialidad y ubicación desde la API', async () => {
  simular(); renderizarApp('/profesionales');
  expect(await screen.findByRole('heading', { name: 'Ana Demo' })).toBeInTheDocument();
  expect(screen.getByText('Melipilla')).toBeInTheDocument();
  expect(screen.getByText('Nutrición', { selector: 'span' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Ver ubicación de Ana/ })).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=-33.686%2C-71.215');
});
test('envía el filtro a la API, muestra vacío y permite limpiarlo', async () => {
  const fetch = simular((url) => ({ profesionales: url.includes('especialidad=') ? [] : [ficha], pagina: 1, hayMas: false }));
  renderizarApp('/profesionales');
  await screen.findByRole('heading', { name: 'Ana Demo' });
  await userEvent.type(screen.getByLabelText('Especialidad'), 'Inexistente');
  await userEvent.click(screen.getByRole('button', { name: 'Buscar profesionales' }));
  expect(await screen.findByRole('heading', { name: 'No hay profesionales para esta especialidad' })).toBeInTheDocument();
  expect(fetch.mock.calls.some(([url]) => url.includes('especialidad=Inexistente'))).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtro' }));
  expect(await screen.findByRole('heading', { name: 'Ana Demo' })).toBeInTheDocument();
});
test('la página siguiente conserva el filtro y al buscar reinicia a la primera', async () => {
  const fetch = simular((url) => ({ profesionales: [ficha], pagina: Number(new URL(url, 'http://localhost').searchParams.get('pagina')), hayMas: true }));
  renderizarApp('/profesionales?especialidad=Nutrici%C3%B3n');
  await screen.findByRole('heading', { name: 'Ana Demo' });
  await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(await screen.findByText('Página 2')).toBeInTheDocument();
  expect(fetch.mock.calls.some(([url]) => url.includes('pagina=2&especialidad=Nutrici%C3%B3n'))).toBe(true);
  await userEvent.clear(screen.getByLabelText('Especialidad'));
  await userEvent.type(screen.getByLabelText('Especialidad'), 'Kinesiología');
  await userEvent.click(screen.getByRole('button', { name: 'Buscar profesionales' }));
  expect(await screen.findByText('Página 1')).toBeInTheDocument();
});
test('sin registros muestra un estado vacío', async () => {
  simular(() => ({ profesionales: [], pagina: 1, hayMas: false })); renderizarApp('/profesionales');
  expect(await screen.findByText('Aún no hay profesionales para mostrar')).toBeInTheDocument();
});
test('sin establecimiento muestra coordenadas sin inventar una dirección', async () => {
  simular(() => ({ profesionales: [{ ...ficha, establecimiento: null }], pagina: 1, hayMas: false })); renderizarApp('/profesionales');
  expect(await screen.findByText('Coordenadas: -33.686, -71.215')).toBeInTheDocument();
});
test('muestra carga y permite reintentar tras un fallo de red', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Sin red'));
  renderizarApp('/profesionales');
  expect(screen.getByRole('status')).toHaveTextContent('Cargando profesionales');
  await screen.findByRole('button', { name: 'Reintentar' });
  fetch.mockImplementation((url) => respuestaJson(200, url.includes('/especialidades') ? { especialidades: [] } : { profesionales: [ficha], pagina: 1, hayMas: false }));
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Ana Demo' })).toBeInTheDocument());
});
