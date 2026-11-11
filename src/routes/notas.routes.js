const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const notas = require('../services/notas.service');

const notaSchema = z.object({
  titulo: z.string().min(1, 'El título es obligatorio').max(100, 'El título no puede exceder 100 caracteres'),
  contenido: z.string().min(1, 'El contenido es obligatorio').max(5000, 'El contenido no puede exceder 5000 caracteres'),
});

/**
 * @openapi
 * /api/notas:
 *   get:
 *     summary: Lista todas las notas en memoria
 *     tags: [Notas]
 *     responses:
 *       200:
 *         description: Lista de todas las notas registradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Nota'
 */
router.get('/', (req, res) => res.json(notas.listar()));

/**
 * @openapi
 * /api/notas:
 *   post:
 *     summary: Crea una nueva nota
 *     tags: [Notas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotaInput'
 *     responses:
 *       201:
 *         description: Nota creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       400:
 *         description: Error de validación en los campos enviados (Zod)
 */
router.post('/', validar(notaSchema), (req, res) => {
  const nuevaNota = notas.crear(req.body);
  res.status(201).json(nuevaNota);
});

/**
 * @openapi
 * /api/notas/{id}:
 *   get:
 *     summary: Obtiene una nota específica por su ID
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico de la nota a consultar
 *     responses:
 *       200:
 *         description: Nota encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       404:
 *         description: Nota no encontrada
 */
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const nota = notas.buscar(id);
  res.json(nota);
});

/**
 * @openapi
 * /api/notas/{id}:
 *   delete:
 *     summary: Elimina una nota por su ID
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico de la nota a eliminar
 *     responses:
 *       204:
 *         description: Nota eliminada exitosamente (sin contenido)
 *       404:
 *         description: Nota no encontrada
 */
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  notas.eliminar(id);
  res.status(204).send();
});

module.exports = router;
