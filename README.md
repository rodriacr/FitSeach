# FitSearch

Plataforma web responsiva que conecta a personas que buscan mejorar su salud, condición física o alimentación con profesionales y establecimientos de salud, deporte y bienestar, mediante búsqueda geolocalizada, un asistente de inteligencia artificial y un gestor de alimentación por lenguaje natural.

Proyecto Capstone (PTY4614) — Duoc UC, Escuela de Informática y Telecomunicaciones, sección 003D, sede Melipilla.

> **Estado:** Fase 2 — Sprint 1 (FS-HU-01 Registro y login, FS-HU-02 Datos básicos del perfil).

## Equipo

| Integrante | Rol Scrum | Foco de desarrollo |
|---|---|---|
| Rodrigo Cárcamo Rojas | Product Owner | Backend, datos e IA |
| Luis Méndez | Scrum Master | Backend, base de datos y frontend |
| Nicolás Silva | Desarrollador | Frontend |

## Alcance del MVP

- Registro, inicio de sesión y perfiles de usuario y profesional (roles: usuario, profesional, administrador).
- Directorio de profesionales y establecimientos con búsqueda geolocalizada, vista de mapa y lista.
- Asistente de orientación en salud y bienestar (API de Claude) que recomienda categorías de profesionales.
- Gestor de alimentación: registro de comidas en lenguaje natural y seguimiento de calorías y macronutrientes.
- Reserva básica de horas: el profesional publica su disponibilidad y el usuario reserva indicando brevemente lo que necesita.
- Despliegue con contenedores Docker.

Fuera de alcance este semestre: pagos, integración con calendarios externos, verificación avanzada de profesionales e integración con wearables. El asistente entrega orientación general y no reemplaza la atención de un profesional de salud.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite, JavaScript, CSS mobile-first |
| Backend | Node.js + Express (API REST) |
| Base de datos | MySQL 8 + Prisma (ORM y migraciones) |
| Autenticación | JWT + bcryptjs, control de acceso por roles |
| Mapas | Google Maps Platform (Maps JavaScript, Geocoding, Places) |
| IA | API de Claude (Anthropic) con function calling |
| Contenedores | Docker + docker-compose (frontend con Nginx, backend, MySQL) |
| Pruebas | Backend: Jest + Supertest · Frontend: Vitest + Testing Library · Postman/Insomnia |

## Estructura del repositorio

El repositorio contiene el código de la aplicación y la documentación del proyecto, organizada según el instructivo de la asignatura.

```
FitSeach/
├── FASE 1/                # Evidencias de la Fase 1 (individuales y grupales)
├── FASE 2/                # Evidencias de la Fase 2
│   ├── Evidencias Individuales/
│   ├── Evidencias Grupales/        # Guía 2.4 y planillas de evaluación
│   └── Evidencias Proyecto/
│       ├── Evidencias de documentación/   # DAS, DoD, Sprint 1, Plan de Pruebas, control
│       └── Evidencias de sistema/         # capturas de la aplicación y de la base de datos
├── FASE 3/                # Evidencias de la Fase 3
├── frontend/              # React + Vite
│   └── src/
│       ├── pages/         # Pantallas de la aplicación (y sus pruebas)
│       ├── components/    # Componentes de UI reutilizables
│       ├── context/       # Estado global de la sesión
│       ├── services/      # Cliente de la API REST y validaciones
│       └── tests/         # Configuración y utilidades de pruebas
├── backend/               # Node.js + Express
│   ├── prisma/            # Esquema, migraciones, datos iniciales y script de creación de la BD
│   ├── src/
│   │   ├── routes/        # Definición de endpoints
│   │   ├── controllers/   # Orquestan las peticiones
│   │   ├── services/      # Lógica de negocio e IA
│   │   ├── models/        # Acceso a datos (Prisma / MySQL)
│   │   ├── middlewares/   # Autenticación, validación y manejo de errores
│   │   ├── validators/    # Reglas de validación por endpoint
│   │   └── config/        # Variables de entorno
│   └── tests/             # Pruebas unitarias y de integración
├── shared/                # Reglas comunes a frontend y backend (reglas.json)
├── docker-compose.yml
└── README.md
```

La documentación oficial (Documento de Arquitectura, Definition of Done, plan de pruebas y seguimiento de sprints) está en `FASE 2/Evidencias Proyecto/Evidencias de documentación/`.

## Requisitos previos

- Node.js 20 LTS o superior y npm
- MySQL 8
- Docker y Docker Compose (para el despliegue en contenedores)
- Clave de API de Google Maps Platform y de la API de Claude (a partir de los Sprints 3 y 4)

## Instalación (ambiente local)

### 1. Clonar el repositorio

```bash
git clone https://github.com/rodriacr/FitSeach.git
cd FitSeach
```

### 2. Base de datos

1. Abrir `backend/prisma/crear_base_datos.sql` y reemplazar `CAMBIAR_CONTRASENA` (2 veces) por una contraseña propia. No guardar el archivo con la contraseña real.
2. Ejecutar el script con un usuario administrador de MySQL (por ejemplo, `root` en MySQL Workbench). Crea las bases `fitsearch` y `fitsearch_shadow` y el usuario `fitsearch`.

> Si `npm run db:migrate` muestra `Unknown authentication plugin 'sha256_password'`, el usuario quedó con un método de autenticación que Prisma no admite. Ejecutar en Workbench (con `root`): `ALTER USER 'fitsearch'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'tu_contraseña';` y reintentar.

### 3. Variables de entorno del backend

```bash
cd backend
cp .env.example .env
```

Completar `backend/.env`:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (por defecto 3000) |
| `DATABASE_URL` | Conexión a MySQL con el usuario y la contraseña del paso 2 |
| `SHADOW_DATABASE_URL` | Base auxiliar que Prisma usa para crear migraciones (solo desarrollo) |
| `JWT_SECRET` | Cadena larga y aleatoria para firmar los tokens |
| `JWT_EXPIRES_IN` | Duración de la sesión (por defecto `8h`) |
| `BCRYPT_COST` | Costo del hash de contraseñas (por defecto 10) |

### 4. Backend

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

`db:migrate` crea las tablas a partir de las migraciones versionadas y `db:seed` carga los roles (usuario, profesional, administrador). La API queda disponible en `http://localhost:3000/api` (verificación: `GET /api/salud`).

### 5. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173`. Vite reenvía las llamadas a `/api` hacia el backend.

## API disponible (Sprint 1)

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| GET | `/api/salud` | No | Estado de la API |
| POST | `/api/auth/registro` | No | Crea la cuenta (rol usuario) y devuelve el token |
| POST | `/api/auth/login` | No | Inicia sesión y devuelve el token |
| POST | `/api/auth/logout` | Bearer JWT | Cierra la sesión |
| GET | `/api/perfil` | Bearer JWT | Datos del usuario, perfil básico y requerimiento calórico estimado |
| PUT | `/api/perfil` | Bearer JWT | Guarda peso, altura, edad, sexo y actividad física |

Los errores se responden como `{ "error": "mensaje", "detalles": { "campo": "mensaje" } }`.

## Ejecución con Docker

_Pendiente (FS-HU-11, Sprint 5)._

## Pruebas

```bash
cd backend && npm test      # Jest + Supertest (unitarias e integración de la API)
cd frontend && npm test     # Vitest + Testing Library (validaciones y pantallas)
npm run lint                # en cada carpeta: ESLint sin errores (DoD-05)
npm audit                   # en cada carpeta: sin vulnerabilidades críticas ni altas (DoD-12)
```

Las pruebas de integración del backend simulan el acceso a datos, por lo que no requieren MySQL.

## Convenciones de trabajo

- Metodología Scrum con sprints de 2 semanas (Sprint 5 de 3 semanas).
- Una historia de usuario se considera terminada solo si cumple la Definition of Done del proyecto.
- Todo el proyecto (código, documentación y evidencias) se entrega en español.
