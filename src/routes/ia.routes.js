const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const deepseek = require('../services/deepseek.service');
const preguntaSchema = z.object({ pregunta: z.string().trim().min(3).max(2000) });
/**
 * @openapi
 * /api/ia/preguntar:
 *   post:
 *     summary: Preguntar a DeepSeek
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pregunta'
 *     responses:
 *       200:
 *         description: Respuesta generada y consumo reportado
 *       400:
 *         description: Pregunta inválida
 *       429:
 *         description: Límite del proveedor
 *       502:
 *         description: Proveedor no disponible
 *       503:
 *         description: IA no configurada o timeout
 */
router.post('/preguntar', validar(preguntaSchema), async (req, res) => {
  res.json(await deepseek.preguntar(req.body.pregunta));
});
module.exports = router;
