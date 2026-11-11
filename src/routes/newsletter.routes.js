const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const newsletterService = require('../services/newsletter.service');

const newsletterSchema = z.object({
  email: z.string().trim().email('Por favor ingresa un correo electrónico válido'),
});

/**
 * @openapi
 * /api/newsletter:
 *   post:
 *     summary: Suscribirse al boletín VIP de VapeKing CR
 *     tags: [VapeKing - Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: "cliente@gmail.com" }
 *     responses:
 *       200:
 *         description: Suscripción confirmada con cupón
 *       400:
 *         description: Email inválido
 */
router.post('/', validar(newsletterSchema), (req, res) => {
  const resultado = newsletterService.suscribir(req.body.email);
  res.json(resultado);
});

/**
 * @openapi
 * /api/newsletter:
 *   get:
 *     summary: Listar correos de la lista VIP
 *     tags: [VapeKing - Newsletter]
 *     responses:
 *       200:
 *         description: Lista de suscriptores
 */
router.get('/', (req, res) => {
  res.json({
    total: newsletterService.listarSuscriptores().length,
    suscriptores: newsletterService.listarSuscriptores(),
  });
});

module.exports = router;
