const request = require('supertest');
const express = require('express');
const app = express();
app.use('/google', require('../../src/routes/google.routes'));
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; delete process.env.GOOGLE_MAPS_API_KEY; });
test('requiere comuna y rechaza parámetros repetidos', async () => {
  expect((await request(app).get('/google/profesionales')).status).toBe(400);
  expect((await request(app).get('/google/profesionales?comuna=A&comuna=B')).status).toBe(400);
});
test('sin clave responde 503 sin consultar Google', async () => {
  global.fetch = jest.fn();
  expect((await request(app).get('/google/profesionales?comuna=Melipilla')).status).toBe(503);
  expect(global.fetch).not.toHaveBeenCalled();
});
test('consulta Google desde servidor y devuelve datos públicos', async () => {
  process.env.GOOGLE_MAPS_API_KEY = 'clave-prueba';
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ places: [{ id: 'p1', displayName: { text: 'Consulta' }, formattedAddress: 'Melipilla', googleMapsUri: 'https://maps.google.com/', attributions: [{ provider: 'Proveedor' }] }] }) });
  const r = await request(app).get('/google/profesionales?comuna=Melipilla&especialidad=Kinesiologia');
  expect(r.status).toBe(200);
  expect(r.body.profesionales[0].nombre).toBe('Consulta');
  expect(JSON.stringify(r.body)).not.toContain('clave-prueba');
  expect(JSON.parse(global.fetch.mock.calls[0][1].body).textQuery).toBe('Kinesiologia en Melipilla');
});
test('oculta errores del proveedor', async () => {
  process.env.GOOGLE_MAPS_API_KEY = 'clave-prueba';
  global.fetch = jest.fn().mockResolvedValue({ ok: false });
  expect((await request(app).get('/google/profesionales?comuna=Melipilla')).status).toBe(502);
});
