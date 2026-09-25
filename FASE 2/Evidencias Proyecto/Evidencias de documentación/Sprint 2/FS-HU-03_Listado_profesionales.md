# FS-HU-03 — Listado de profesionales

Fecha: 24-09-2026. Responsable del avance: Nicolás Silva. Base: `main`, commit `07f9039`. Rama: `codex/listado-profesionales`.

Estado: implementado y verificado localmente; pendiente de PR, revisión del equipo y aceptación del Product Owner. Este registro no declara cerrado el Sprint 2 ni aprobada la DoD.

## Trazabilidad y alcance

Historia: «Como un usuario, necesito ver un listado de profesionales con su especialidad y ubicación, con la finalidad de elegir a quién contactar».

Se implementan las cuatro tareas del Sprint Backlog, filas 6 a 9:

1. Tablas `establecimientos` y `profesionales`, migración Prisma y datos de prueba opcionales.
2. `GET /api/profesionales` con filtro por especialidad.
3. Pantalla de tarjetas con nombre, especialidad y ubicación.
4. Pruebas automatizadas con Jest/Supertest y Vitest/Testing Library.

Los criterios de aceptación se conservan: mostrar tarjetas cuando hay fichas y mostrar un mensaje cuando el filtro no tiene coincidencias. Se agregan estados de carga, error recuperable, limpieza del filtro y paginación para no descargar todo el directorio.

El alcance original de HU-03 no incluye edición del perfil (HU-04), horarios (HU-13), reservas, búsqueda por distancia, mapa incrustado ni profesionales externos de Google Places. El enlace de cada tarjeta abre Google Maps con las coordenadas públicas, sin clave API. FS-HU-05 y FS-HU-06 conservan su alcance de búsqueda geolocalizada y mapa/lista.

## Implementación y arquitectura

Se mantiene React/Vite y JavaScript, componentes `Encabezado`, `Alerta`, `Icono`, cliente HTTP existente y variables CSS de la identidad Poppins/azul/naranja. Ruta: `/profesionales`; acceso desde «Buscar profesionales» en el encabezado. El directorio es público y solo expone información profesional.

Ajuste visual del acceso: pestaña discreta con icono de búsqueda, área de interacción de al menos 44 px, fondo suave cuando está activa (`aria-current="page"`), sin azul sólido ni acento naranja. Mantiene el texto completo, foco visible y adaptación al encabezado móvil. La captura hu03_05 corresponde al diseño anterior.

### Ampliación solicitada: búsqueda unificada con Google Maps

Un único formulario actualiza el filtro de especialidad de FitSearch y la búsqueda del mapa de Google. Incluye comuna o ciudad opcional; sin zona se muestran todas las fichas y el mapa se centra en una búsqueda general en Chile. En computador las fichas aparecen junto al mapa; en pantallas pequeñas se apilan dentro de la misma vista. Se retiró el formulario externo separado.

Las tarjetas siguen siendo registros de MySQL y los resultados de Google aparecen como lugares en su mapa, identificados por su origen. La comuna filtra también FitSearch por coincidencia de texto en la dirección del establecimiento (sin distinguir mayúsculas ni acentos). Las fichas sin establecimiento/dirección quedan fuera cuando se aplica este filtro; no se infiere la comuna a partir de coordenadas. No se importa información de Google a MySQL. Sin especialidad se buscan profesionales de salud y deporte; con Kinesiología se buscan esos servicios en la zona indicada. El mapa depende de la disponibilidad de Google y del navegador; el enlace externo permite abrir los resultados directamente. No cierra HU-05/HU-06.

Validación del ajuste: 45 pruebas de frontend aprobadas, incluida una que comprueba que el mismo envío actualiza la API y la consulta del mapa; lint y compilación aprobados. La comprobación visual de este último ajuste quedó pendiente porque el control de aprobación de la herramienta de navegador alcanzó su límite de uso. Las capturas anteriores corresponden a versiones previas.

El backend sigue rutas → validadores → controlador → servicio → modelo Prisma. El filtro es una especialidad completa (seleccionada del catálogo o escrita), sin distinguir mayúsculas ni acentos bajo la collation MySQL `utf8mb4_unicode_ci` de la migración. No es búsqueda parcial. Se eliminan espacios externos. La interfaz conserva filtro y página en la URL, reinicia la página al cambiar el filtro y descarta respuestas de solicitudes anteriores.

La migración `20260924160000_directorio_profesionales` incorpora el modelo del DAS:

- `profesionales`: `id`, `usuario_id` único, `establecimiento_id` opcional, `especialidad` (100), `descripcion` nullable, `verificado` con valor inicial falso y coordenadas `DECIMAL(10,7)`. Índice de especialidad y relación con usuarios.
- `establecimientos`: `id`, `nombre` (150), `categoria` (50), `direccion` (255) y coordenadas.
- Al eliminar una cuenta se elimina su ficha; al eliminar un establecimiento se conserva la ficha sin establecimiento (`SET NULL`). No se modifica ninguna tabla anterior salvo la nueva relación lógica en Prisma.

Si no existe establecimiento, la tarjeta muestra las coordenadas reales de atención y su enlace; no inventa una dirección. El nombre se obtiene de `usuarios.nombre`. Solo se listan fichas asociadas a cuentas con rol profesional. Registrarse con ese rol no crea automáticamente una ficha: esa gestión corresponde a HU-04.

## Contrato de API

`GET /api/profesionales?especialidad=Nutrición&pagina=1`

- Parámetros opcionales: especialidad de hasta 100 caracteres; página entera entre 1 y 100000 (predeterminada 1).
- Orden estable por `id` ascendente, 12 fichas por página; `hayMas` señala si existe otra página.
- `200`: `{ profesionales: [{ id, nombre, especialidad, descripcion, ubicacionLat, ubicacionLng, establecimiento: { nombre, direccion } | null }], pagina, hayMas }`.
- Sin coincidencias: lista vacía, no error. Parámetros inválidos/repetidos: `400` con el formato de errores existente.
- `GET /api/profesionales/especialidades`: `{ especialidades: [...] }`, catálogo ordenado desde las fichas existentes.
- No se exponen correo de acceso, contraseña, ID de usuario ni datos personales/de salud. Los campos devueltos se seleccionan explícitamente.

## Cómo ejecutar el avance

En una copia de esta rama con MySQL 8 y las variables del `.env.example` configuradas, desde `backend`:

```powershell
npm.cmd ci
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
# Opcional y solo para desarrollo:
npm.cmd run db:seed:profesionales
npm.cmd run dev
```

Desde `frontend`, en otra terminal:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abrir `/profesionales` en la URL de Vite. El seed opcional crea tres fichas ficticias, dos con establecimiento y una sin él. Usa correos `example.test`, nombres Demo y descripciones explícitas; no configura contraseñas de acceso. Repetirlo no duplica ni sobrescribe las cuentas/fichas. El seed normal sigue cargando solo los roles. En producción el seed de demostración se rechaza.

No requiere paquetes nuevos ni claves de Google. Se conservan variables de entorno y puertos predeterminados. La orquestación Docker sigue pendiente en `main` (HU-11); no se afirma haberla implementado o probado en esta entrega. Para un despliegue futuro con Docker bastará configurar la conexión de MySQL y aplicar esta migración como las anteriores.

La prueba local de esta entrega se aisló en `fitsearch_shadow`, comprobada vacía antes de aplicar las migraciones, porque `fitsearch` contenía una ficha de la prueba descartada de HU-04. Se utilizó `migrate deploy`, nunca `migrate dev` ni `reset`. El `.env` local de la prueba no se versiona. Los compañeros deben usar sus propias bases y variables según el README.

## Validación ejecutada

- Backend: **73 pruebas aprobadas**, incluidas 15 pruebas nuevas de HU-03.
- Frontend: **45 pruebas aprobadas**, incluidas 6 pruebas nuevas de HU-03 y una de la búsqueda externa.
- ESLint aprobado en backend y frontend; compilación Vite aprobada.
- `npm audit`: 0 vulnerabilidades en ambas carpetas.
- MySQL real: cinco migraciones aplicadas en una base inicialmente vacía, seed de roles y seed opcional; segunda ejecución sin duplicados.
- API real: lista de tres fichas; filtro `Nutrición`, `nutricion` y con espacios; sin coincidencias; página fuera de resultados; validación 400; catálogo y ausencia de información privada.
- Paginación real: 13 fichas temporales de una misma especialidad devueltas como 12 + 1 sin duplicados; cuentas temporales eliminadas al terminar.
- Navegador contra API/MySQL: lista completa, filtro Nutrición y lista vacía; vista móvil de 390 px sin desplazamiento horizontal (`scrollWidth = clientWidth = 390`), consola sin errores durante la comprobación.

Las pruebas automatizadas habituales simulan la base/fetch; las verificaciones MySQL y navegador anteriores se ejecutaron por separado. No se atribuye aceptación del PO a estas pruebas técnicas.

## Casos de prueba y evidencias

Se agregan CP-024 a CP-030 en la planilla de pruebas, sin modificar los resultados anteriores.

| Caso | Acción y resultado comprobado | Evidencia |
|---|---|---|
| CP-024 | Abrir el directorio: nombre, especialidad y ubicación en tres tarjetas | `hu03_01_listado.png` |
| CP-025 | Buscar Nutrición: solo Ana Demo; limpiar recupera las tres fichas | `hu03_02_filtro.png` |
| CP-026 | Buscar Inexistente: mensaje sin coincidencias y opción de limpiar | `hu03_03_sin_resultados.png` |
| CP-027 | Revisar a 390 px: tarjetas en una columna, controles utilizables y sin desborde | `hu03_04_movil.png` |
| CP-028 | Consultar API: excluye correo de acceso, contraseña, usuario y salud | Prueba automatizada y MySQL real descritas arriba |
| CP-029 | Trece fichas de una especialidad: dos páginas (12 + 1), sin duplicados | Verificación con MySQL real descrita arriba |
| CP-030 | Página inválida responde 400; fallo de red muestra Reintentar y recupera el listado | Jest y Vitest |

Capturas en `Sprint 2/Capturas del sistema/`. Todas muestran datos ficticios.

## Pendiente para integrar

Publicar la rama y abrir PR contra `main`, revisión del equipo, aceptación de los criterios por el PO y registrar horas reales por el responsable. No se inventaron estimaciones, horas ni aprobaciones. Este documento complementa el DAS y el backlog con la implementación efectiva de HU-03.

Verificación de la ampliación: búsqueda de Melipilla, Chile en el navegador con mapa y marcadores visibles. Evidencia: `Capturas del sistema/hu03_06_google_separado.png`. Referencia del enlace externo: [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started).

Filtro de comuna: `GET /api/profesionales?comuna=Melipilla&especialidad=Nutrición`; texto opcional, hasta 150 caracteres, sin parámetros repetidos. La URL conserva comuna y especialidad al paginar y reinicia a página 1 al buscar. Verificación MySQL: Melipilla devuelve dos fichas demo; combinada con Nutrición devuelve una; comuna inexistente devuelve cero. Frontend 45 pruebas, backend 73, lint y build aprobados.

## Mejora visual del directorio

Se mantiene el estilo azul y naranja de FitSearch. Se añade una cabecera con orientación de búsqueda, accesos rápidos a las especialidades del catálogo, identificación de origen de las fichas, descripción de la atención, bloque de ubicación y enlace Cómo llegar. La columna del mapa incorpora una guía para comparar especialidad, ubicación y detalles de atención. No se inventan reseñas, horarios, precios ni antecedentes profesionales.

Validación: 45 pruebas frontend aprobadas, ESLint y compilación Vite aprobados. En navegador se comprobó el acceso rápido Kinesiología (una ficha coincidente) y el diseño móvil con viewport de 390 px sin desbordamiento horizontal (ancho útil y scrollWidth de 375 px). Evidencia: `Capturas del sistema/hu03_07_directorio_mejorado.png`. Durante esta comprobación el iframe externo de Google permaneció en blanco; no se considera validada su carga en esta revisión. El enlace externo sigue disponible y esta mejora no incorpora tarjetas importadas desde Google.