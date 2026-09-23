import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PERFIL_COMPLETO, renderizarApp, respuestaJson, respuestaPerfil, SESION } from '../tests/utilidades.jsx';

describe('Portada pública de FitSearch', () => {
  test('permite conocer la plataforma sin sesión ni peticiones a la API', () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    renderizarApp();

    expect(screen.getByRole('heading', { level: 1, name: /Tu bienestar,\s*un paso más cerca/ })).toBeInTheDocument();
    expect(screen.getAllByText('Próximamente')).toHaveLength(3);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('el llamado principal lleva al registro existente', async () => {
    renderizarApp();
    await userEvent.click(screen.getByRole('link', { name: 'Comenzar mi camino' }));
    expect(screen.getByRole('textbox', { name: 'Nombre completo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrarse' })).toBeInTheDocument();
  });

  test('el acceso del encabezado abre el inicio de sesión', async () => {
    renderizarApp();
    await userEvent.click(screen.getAllByRole('link', { name: 'Iniciar sesión' })[0]);
    expect(screen.getByRole('heading', { name: '¡Bienvenido!' })).toBeInTheDocument();
  });

  test('con sesión conserva la portada y permite entrar al perfil real', async () => {
    sessionStorage.setItem('fitsearch_sesion', JSON.stringify(SESION));
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(() => respuestaJson(200, respuestaPerfil(PERFIL_COMPLETO)));
    renderizarApp();

    expect(screen.queryByRole('link', { name: 'Crear cuenta' })).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('link', { name: 'Ir a mi perfil' }));
    expect(await screen.findByRole('heading', { name: 'Hola, Ana Pérez' })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/perfil', expect.any(Object));
  });
});
