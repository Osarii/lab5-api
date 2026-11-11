const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const deepseek = require('../services/deepseek.service');
const preguntaSchema = z.object({ pregunta: z.string().trim().min(3).max(2000) });
router.post('/preguntar', validar(preguntaSchema), async (req, res) => {
  res.json(await deepseek.preguntar(req.body.pregunta));
});
module.exports = router;
