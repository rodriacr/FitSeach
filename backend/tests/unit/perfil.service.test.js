jest.mock('../../src/models/usuario.model');
jest.mock('../../src/models/perfil.model');

const usuarioModel = require('../../src/models/usuario.model');
const perfilModel = require('../../src/models/perfil.model');
const perfilService = require('../../src/services/perfil.service');
const { usuarioDePrueba } = require('../ayudantes');

describe('perfil.service', () => {
  beforeEach(() => jest.resetAllMocks());

  test('formatearPerfil marca el perfil como incompleto y sin estimación si falta algún dato', () => {
    expect(perfilService.formatearPerfil({ pesoKg: '70.5', alturaCm: null, edad: 30, sexo: 'femenino', actividadFisica: 'ligera' }))
      .toEqual({
        perfil: { pesoKg: 70.5, alturaCm: null, edad: 30, sexo: 'femenino', actividadFisica: 'ligera' },
        completo: false,
        requerimientoCaloricoKcal: null,
      });
  });

  test('formatearPerfil convierte los decimales a número, marca el perfil completo y estima las calorías', () => {
    const resultado = perfilService.formatearPerfil({ pesoKg: '70.00', alturaCm: '175.00', edad: 30, sexo: 'masculino', actividadFisica: 'moderada' });
    expect(resultado.completo).toBe(true);
    expect(resultado.perfil.pesoKg).toBe(70);
    expect(resultado.perfil.alturaCm).toBe(175);
    expect(resultado.requerimientoCaloricoKcal).toBe(2556);
  });

  test('formatearPerfil tolera un usuario sin registro de perfil', () => {
    expect(perfilService.formatearPerfil(null).completo).toBe(false);
  });

  test('obtener responde 401 si el usuario del token ya no existe', async () => {
    usuarioModel.buscarPorIdConPerfil.mockResolvedValue(null);
    await expect(perfilService.obtener(99)).rejects.toMatchObject({ estado: 401 });
  });

  test('actualizar guarda solo los campos del perfil y devuelve el perfil actualizado', async () => {
    const datos = { pesoKg: 70, alturaCm: 175, edad: 30, sexo: 'masculino', actividadFisica: 'moderada' };
    usuarioModel.buscarPorIdConPerfil.mockResolvedValue(usuarioDePrueba({ perfil: { ...datos } }));

    const resultado = await perfilService.actualizar(1, { ...datos, rolId: 3 });

    expect(perfilModel.guardar).toHaveBeenCalledWith(1, datos);
    expect(resultado.completo).toBe(true);
    expect(resultado.usuario.correo).toBe('ana@correo.cl');
  });
});
