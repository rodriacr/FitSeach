// Pruebas de integración de FS-HU-18 (objetivos y estilo de vida) y FS-HU-19 (información de salud). El acceso a datos se simula.
jest.mock('../../src/models/usuario.model');
jest.mock('../../src/models/perfil.model');
jest.mock('../../src/models/salud.model');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const usuarioModel = require('../../src/models/usuario.model');
const perfilModel = require('../../src/models/perfil.model');
const saludModel = require('../../src/models/salud.model');
const { usuarioDePrueba } = require('../ayudantes');

const token = jwt.sign({ rol: 'usuario' }, process.env.JWT_SECRET, { subject: '1', expiresIn: '1h' });
const conSesion = (peticion) => peticion.set('Authorization', `Bearer ${token}`);
const PERFIL_BASICO = { id: 1, usuarioId: 1, pesoKg: 70, alturaCm: 175, edad: 30, sexo: 'masculino', actividadFisica: 'moderada' };
const OBJETIVOS = { objetivoPrincipal: 'bajar_peso', comidasDia: 3, horasSueno: '7_8' };
const SALUD = { condicionesMedicas: ['hipertension'], tomaMedicamentos: true, medicamentos: ['presion'], alergias: ['ninguna'] };

describe('Asistente de perfil: pasos pendientes', () => {
  beforeEach(() => jest.resetAllMocks());

  test('un usuario recién registrado tiene los tres pasos pendientes', async () => {
    usuarioModel.buscarPorIdConPerfil.mockResolvedValue(usuarioDePrueba());

    const { body } = await conSesion(request(app).get('/api/perfil'));

    expect(body.pasos).toEqual({ datosPersonales: false, objetivos: false, salud: false });
    expect(body.objetivos).toEqual({ objetivoPrincipal: null, comidasDia: null, horasSueno: null });
    expect(body.salud).toBeNull();
  });

  test('con los tres pasos guardados el perfil queda completo', async () => {
    usuarioModel.buscarPorIdConPerfil.mockResolvedValue(usuarioDePrueba({
      perfil: { ...PERFIL_BASICO, ...OBJETIVOS },
      informacionSalud: { id: 1, usuarioId: 1, ...SALUD },
    }));

    const { body } = await conSesion(request(app).get('/api/perfil'));

    expect(body.pasos).toEqual({ datosPersonales: true, objetivos: true, salud: true });
    expect(body.objetivos).toEqual(OBJETIVOS);
    expect(body.salud).toEqual(SALUD);
  });
});

describe('PUT /api/perfil/objetivos (FS-HU-18)', () => {
  beforeEach(() => jest.resetAllMocks());

  test('escenario 1: guarda el objetivo, las comidas y las horas de sueño', async () => {
    usuarioModel.buscarPorIdConPerfil.mockResolvedValue(usuarioDePrueba({ perfil: { ...PERFIL_BASICO, ...OBJETIVOS } }));

    const respuesta = await conSesion(request(app).put('/api/perfil/objetivos')).send({ ...OBJETIVOS, comidasDia: '3' });

    expect(respuesta.status).toBe(200);
    expect(perfilModel.guardar).toHaveBeenCalledWith(1, OBJETIVOS);
    expect(respuesta.body.pasos.objetivos).toBe(true);
  });

  test('escenario 2: sin datos o con valores fuera del catálogo no guarda y señala cada campo', async () => {
    const respuesta = await conSesion(request(app).put('/api/perfil/objetivos'))
      .send({ objetivoPrincipal: 'volar', comidasDia: 9 });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles).toEqual({
      objetivoPrincipal: 'Selecciona un objetivo válido',
      comidasDia: 'Selecciona una cantidad de comidas válida',
      horasSueno: 'Indica tus horas de sueño promedio',
    });
    expect(perfilModel.guardar).not.toHaveBeenCalled();
  });

  test('sin token responde 401', async () => {
    const respuesta = await request(app).put('/api/perfil/objetivos').send(OBJETIVOS);
    expect(respuesta.status).toBe(401);
  });
});

describe('PUT /api/perfil/salud (FS-HU-19)', () => {
  beforeEach(() => jest.resetAllMocks());

  test('escenario 1: guarda condiciones, medicamentos y alergias del usuario autenticado', async () => {
    usuarioModel.buscarPorIdConPerfil.mockResolvedValue(usuarioDePrueba({ informacionSalud: { id: 1, usuarioId: 1, ...SALUD } }));

    const respuesta = await conSesion(request(app).put('/api/perfil/salud')).send(SALUD);

    expect(respuesta.status).toBe(200);
    expect(saludModel.guardar).toHaveBeenCalledWith(1, SALUD);
    expect(respuesta.body.salud).toEqual(SALUD);
  });

  test('si no toma medicamentos guarda la lista de medicamentos vacía', async () => {
    usuarioModel.buscarPorIdConPerfil.mockResolvedValue(usuarioDePrueba());

    await conSesion(request(app).put('/api/perfil/salud'))
      .send({ condicionesMedicas: ['ninguna'], tomaMedicamentos: false, medicamentos: [], alergias: ['ambientales'] });

    expect(saludModel.guardar.mock.calls[0][1].medicamentos).toEqual([]);
  });

  test.each([
    ['listas vacías', { condicionesMedicas: [], tomaMedicamentos: false, medicamentos: [], alergias: [] }, ['alergias', 'condicionesMedicas']],
    ['"Ninguna" combinada con otra opción', { ...SALUD, condicionesMedicas: ['ninguna', 'diabetes'] }, ['condicionesMedicas']],
    ['una opción fuera del catálogo', { ...SALUD, alergias: ['polen'] }, ['alergias']],
    ['toma medicamentos pero no indica cuáles', { ...SALUD, medicamentos: [] }, ['medicamentos']],
    ['dice que no toma pero indica medicamentos', { ...SALUD, tomaMedicamentos: false }, ['medicamentos']],
    ['sin responder si toma medicamentos', { ...SALUD, tomaMedicamentos: 'si' }, ['tomaMedicamentos']],
  ])('escenario 2: rechaza %s', async (_, cuerpo, campos) => {
    const respuesta = await conSesion(request(app).put('/api/perfil/salud')).send(cuerpo);

    expect(respuesta.status).toBe(400);
    expect(Object.keys(respuesta.body.detalles).sort()).toEqual(campos);
    expect(saludModel.guardar).not.toHaveBeenCalled();
  });

  test('QS7: sin token no se puede guardar ni consultar la información de salud', async () => {
    expect((await request(app).put('/api/perfil/salud').send(SALUD)).status).toBe(401);
    expect((await request(app).get('/api/perfil')).status).toBe(401);
    expect(saludModel.guardar).not.toHaveBeenCalled();
  });
});
