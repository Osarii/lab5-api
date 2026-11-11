const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const deepseek = require('../services/deepseek.service');
const vapeAiService = require('../services/vape-ai.service');

const preguntaSchema = z.object({ pregunta: z.string().trim().min(3).max(2000) });
const consultaSchema = z.object({ consulta: z.string().trim().min(3, 'La consulta debe tener al menos 3 caracteres').max(2000) });

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

/**
 * @openapi
 * /api/ia/recomendar:
 *   post:
 *     summary: Asesoría de compra y recomendación del Sommelier Virtual VapeBot CR
 *     tags: [VapeKing - Asistente IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [consulta]
 *             properties:
 *               consulta: { type: string, example: "Busco un pod kit con buen sabor a menta y fácil de recargar" }
 *     responses:
 *       200:
 *         description: Recomendación experta generada por DeepSeek
 *       400:
 *         description: Consulta inválida
 *       502:
 *         description: Error en el servicio de IA
 */
router.post('/recomendar', validar(consultaSchema), async (req, res) => {
  res.json(await vapeAiService.recomendar(req.body.consulta));
});

/**
 * @openapi
 * /api/ia/producto/{id}/resumen:
 *   post:
 *     summary: Generar resumen técnico en 3 viñetas para un producto de la tienda
 *     tags: [VapeKing - Asistente IA]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Resumen generado por DeepSeek
 *       404:
 *         description: Producto no encontrado
 */
router.post('/producto/:id/resumen', async (req, res) => {
  res.json(await vapeAiService.resumirProducto(req.params.id));
});

module.exports = router;
