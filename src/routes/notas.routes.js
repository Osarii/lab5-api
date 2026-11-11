const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const notas = require('../services/notas.service');

const notaSchema = z.object({
  titulo: z.string().min(1, 'El título es obligatorio').max(100, 'El título no puede exceder 100 caracteres'),
  contenido: z.string().min(1, 'El contenido es obligatorio').max(5000, 'El contenido no puede exceder 5000 caracteres'),
});

router.get('/', (req, res) => res.json(notas.listar()));

router.post('/', validar(notaSchema), (req, res) => {
  const nuevaNota = notas.crear(req.body);
  res.status(201).json(nuevaNota);
});

module.exports = router;
