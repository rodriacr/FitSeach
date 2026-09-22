// Configuración de la aplicación Express (sin levantar el servidor, para poder probarla con Supertest).
const express = require('express');
const helmet = require('helmet');
const rutas = require('./routes');
const { rutaNoEncontrada, manejoErrores } = require('./middlewares/manejoErrores');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '100kb' }));

app.use('/api', rutas);
app.use(rutaNoEncontrada);
app.use(manejoErrores);

module.exports = app;
