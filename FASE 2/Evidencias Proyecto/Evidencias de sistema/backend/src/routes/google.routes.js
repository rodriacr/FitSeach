const { Router } = require('express');
const router = Router();
let ventana = 0;
let llamadas = 0;
router.get('/profesionales', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { especialidad = 'profesionales de salud y deporte', comuna } = req.query;
  if (typeof especialidad !== 'string' || !especialidad.trim() || especialidad.length > 100 || typeof comuna !== 'string' || !comuna.trim() || comuna.length > 150) {
    return res.status(400).json({ error: 'Indica una especialidad válida y una comuna o ciudad (máximo 150 caracteres).' });
  }
  const clave = process.env.GOOGLE_MAPS_API_KEY;
  if (!clave) return res.status(503).json({ error: 'La búsqueda de Google aún no está configurada. Puedes consultar el mapa o buscar en FitSearch.' });
  // Límite global por proceso: acota el consumo de la API externa.
  if (Date.now() - ventana >= 60000) { ventana = Date.now(); llamadas = 0; }
  if (llamadas >= 20) return res.status(429).set('Retry-After', '60').json({ error: 'Se alcanzó el límite de búsquedas de Google. Intenta en un minuto.' });
  llamadas++;
  try {
    const respuesta = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': clave,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.attributions' },
      body: JSON.stringify({ textQuery: especialidad.trim() + ' en ' + comuna.trim(), languageCode: 'es', regionCode: 'CL', pageSize: 12 }),
      signal: AbortSignal.timeout(10000),
    });
    if (!respuesta.ok) return res.status(502).json({ error: 'Google no pudo completar la búsqueda. Intenta más tarde.' });
    const datos = await respuesta.json();
    const profesionales = (datos.places || []).filter(p => p.id && p.displayName?.text).map(p => ({
      id: p.id, nombre: p.displayName.text, direccion: p.formattedAddress || 'Dirección no publicada',
      url: p.googleMapsUri, atribuciones: p.attributions || [],
    }));
    return res.json({ profesionales, fuente: 'Google Maps' });
  } catch {
    return res.status(502).json({ error: 'No fue posible conectar con Google. Intenta más tarde.' });
  }
});
module.exports = router;
