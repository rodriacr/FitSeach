const { Router } = require('express');
const authRoutes = require('./auth.routes');
const perfilRoutes = require('./perfil.routes');

const router = Router();

router.get('/salud', (req, res) => res.json({ estado: 'ok' }));
router.use('/auth', authRoutes);
router.use('/perfil', perfilRoutes);

module.exports = router;
