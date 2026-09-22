import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { renderizarApp, respuestaJson, respuestaPerfil, SESION } from '../tests/utilidades.jsx';

async function completarFormulario({ confirmacion = 'ClaveSegura123' } = {}) {
  await userEvent.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
  await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.cl');
  await userEvent.type(screen.getByLabelText('Contraseña (mínimo 8 caracteres)'), 'ClaveSegura123');
  await userEvent.type(screen.getByLabelText('Confirmar contraseña'), confirmacion);
}

describe('Registro con rol (FS-HU-01 y FS-HU-17)', () => {
  test('FS-HU-17 escenario 1: registra una cuenta de profesional con el rol elegido', async () => {
    const usuario = { ...SESION.usuario, rol: 'profesional' };
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation((url) => (url === '/api/auth/registro'
      ? respuestaJson(201, { ...SESION, usuario })
      : respuestaJson(200, respuestaPerfil({ usuario }))));
    renderizarApp('/registro');

    expect(screen.getByLabelText('Usuario')).toBeChecked();
    await completarFormulario();
    await userEvent.click(screen.getByLabelText('Profesional'));
    await userEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    expect(await screen.findByText('Tu cuenta fue creada y la sesión está iniciada.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Datos personales' })).toBeInTheDocument();
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      nombre: 'Ana Pérez', correo: 'ana@correo.cl', password: 'ClaveSegura123', rol: 'profesional' });
  });

  test('FS-HU-17 escenario 2: con contraseñas distintas no envía el registro', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    renderizarApp('/registro');

    await completarFormulario({ confirmacion: 'OtraClave999' });
    await userEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('no muestra términos ni Apple, y Google queda pendiente mientras no esté configurado', () => {
    renderizarApp('/registro');

    expect(screen.queryByText(/Términos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Apple/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeDisabled();
  });
});
