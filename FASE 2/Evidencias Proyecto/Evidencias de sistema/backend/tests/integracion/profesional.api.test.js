jest.mock('../../src/models/profesional.model');
const request = require('supertest');
const app = require('../../src/app');
const modelo = require('../../src/models/profesional.model');
const ficha = {
  id: 1, especialidad: 'Nutrición', descripcion: 'Atención nutricional', ubicacionLat: '-33.6860000', ubicacionLng: '-71.2150000',
  usuario: { nombre: 'Ana Demo', correo: 'privado@example.test', passwordHash: 'privado', informacionSalud: { alergias: ['ninguna'] } },
  establecimiento: { nombre: 'Consulta Demo', direccion: 'Melipilla' }, usuarioId: 10,
};
beforeEach(() => jest.resetAllMocks());

test('HU-03: lista fichas sin filtrar y excluye información privada', async () => {
  modelo.listar.mockResolvedValue([ficha]);
  const res = await request(app).get('/api/profesionales');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ pagina: 1, hayMas: false, profesionales: [{
    id: 1, nombre: 'Ana Demo', especialidad: 'Nutrición', descripcion: 'Atención nutricional', ubicacionLat: -33.686, ubicacionLng: -71.215,
    establecimiento: { nombre: 'Consulta Demo', direccion: 'Melipilla' },
  }] });
  expect(modelo.listar).toHaveBeenCalledWith({ especialidad: '', comuna: '', pagina: 1, limite: 12 });
});
test('aplica especialidad y página, retirando espacios', async () => {
  modelo.listar.mockResolvedValue([ficha]);
  const res = await request(app).get('/api/profesionales').query({ especialidad: ' Nutrición ', pagina: '2' });
  expect(res.status).toBe(200);
  expect(modelo.listar).toHaveBeenCalledWith({ especialidad: 'Nutrición', comuna: '', pagina: 2, limite: 12 });
});
test('sin coincidencias devuelve lista vacía', async () => {
  modelo.listar.mockResolvedValue([]);
  const res = await request(app).get('/api/profesionales?especialidad=Inexistente');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ profesionales: [], pagina: 1, hayMas: false });
});
test('pagina con 12 fichas como máximo y señala si hay más', async () => {
  modelo.listar.mockResolvedValue(Array.from({ length: 13 }, (_, i) => ({ ...ficha, id: i + 1 })));
  const res = await request(app).get('/api/profesionales');
  expect(res.body.profesionales).toHaveLength(12);
  expect(res.body.hayMas).toBe(true);
});
test('sin establecimiento conserva las coordenadas de atención', async () => {
  modelo.listar.mockResolvedValue([{ ...ficha, establecimiento: null }]);
  const res = await request(app).get('/api/profesionales');
  expect(res.body.profesionales[0]).toMatchObject({ establecimiento: null, ubicacionLat: -33.686 });
});
test.each(['0', '-1', '1.5', 'abc', '100001'])('rechaza página %s', async (pagina) => {
  const res = await request(app).get('/api/profesionales').query({ pagina });
  expect(res.status).toBe(400);
  expect(modelo.listar).not.toHaveBeenCalled();
});
test('rechaza especialidades demasiado largas', async () => {
  expect((await request(app).get('/api/profesionales').query({ especialidad: 'a'.repeat(101) })).status).toBe(400);
  expect(modelo.listar).not.toHaveBeenCalled();
});
test('rechaza parámetros repetidos sin generar un error interno', async () => {
  expect((await request(app).get('/api/profesionales?especialidad=A&especialidad=B')).status).toBe(400);
  expect((await request(app).get('/api/profesionales?pagina=1&pagina=2')).status).toBe(400);
});
test('catálogo de especialidades', async () => {
  modelo.especialidades.mockResolvedValue(['Kinesiología', 'Nutrición']);
  const res = await request(app).get('/api/profesionales/especialidades');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ especialidades: ['Kinesiología', 'Nutrición'] });
});

test('combina comuna y especialidad en la consulta', async () => {
  modelo.listar.mockResolvedValue([]);
  const res = await request(app).get('/api/profesionales').query({ comuna: ' Melipilla ', especialidad: 'Nutrición' });
  expect(res.status).toBe(200);
  expect(modelo.listar).toHaveBeenCalledWith({ comuna: 'Melipilla', especialidad: 'Nutrición', pagina: 1, limite: 12 });
});
test('rechaza comuna repetida o demasiado larga', async () => {
  expect((await request(app).get('/api/profesionales?comuna=A&comuna=B')).status).toBe(400);
  expect((await request(app).get('/api/profesionales').query({ comuna: 'a'.repeat(151) })).status).toBe(400);
});
