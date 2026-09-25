const { Router } = require('express');
const controlador = require('../controllers/profesional.controller');
const validadores = require('../validators/profesional.validators');
const validar = require('../middlewares/validar');
const router = Router();
router.get('/especialidades', controlador.especialidades);
router.get('/', validadores, validar, controlador.listar);
module.exports = router;
