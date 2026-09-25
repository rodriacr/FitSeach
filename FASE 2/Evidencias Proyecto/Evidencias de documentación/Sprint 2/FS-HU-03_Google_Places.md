# Integración complementaria: Google Places

GET /api/google/profesionales?especialidad=Kinesiología&comuna=Melipilla

Consulta Text Search (New) desde Express, devuelve hasta 12 lugares con nombre, dirección, URL y atribuciones. No registra estos lugares en MySQL ni los marca como profesionales verificados. La búsqueda compartida consulta ambas fuentes al aplicar especialidad y comuna. Las tarjetas de Google aparecen en la misma columna que las fichas FitSearch, con la etiqueta Registrado en Google; el mapa permanece al lado. No hay botón independiente de Google. Sin comuna no consulta. Los errores no afectan el listado FitSearch.

## Configuración

1. En el proyecto del equipo en Google Cloud, habilitar Places API (New) y su facturación.
2. Crear una clave restringida a Places API (New), con restricción de IP del servidor cuando corresponda.
3. Colocar GOOGLE_MAPS_API_KEY en backend/.env; nunca usar VITE_ ni subir la clave a GitHub.
4. Reiniciar backend. En Docker pasar esta variable al contenedor backend mediante env_file o secrets del despliegue. No se añade ni valida una orquestación Docker en esta entrega.
5. Buscar especialidad y comuna; pulsar Buscar profesionales.

Google factura según su tarifa y campos solicitados. Configurar cuotas en Google Cloud. El servidor aplica además 20 llamadas/minuto por proceso y timeout de 10 segundos; para múltiples réplicas se requiere límite compartido. No se guardan ni cachean respuestas de Places. No se solicitan reseñas, fotos o teléfonos. Mostrar atribución Google Maps y atribuciones del proveedor. Antes de publicar, incorporar los términos y privacidad exigidos por Google a los documentos públicos del proyecto.

## Validación

77 pruebas backend y 45 frontend aprobadas; lint de ambos y build frontend aprobados. Cuatro pruebas nuevas verifican entrada inválida, ausencia de clave sin llamadas externas, conversión de respuesta y fallo del proveedor. Las respuestas Google se simulan en pruebas: falta configurar una clave del equipo y comprobar la consulta real. El mapa embebido anterior no se reemplaza con esta integración.

Fuentes oficiales:
- https://developers.google.com/maps/documentation/places/web-service/text-search
- https://developers.google.com/maps/documentation/places/web-service/policies
- https://developers.google.com/maps/documentation/places/web-service/usage-and-billing