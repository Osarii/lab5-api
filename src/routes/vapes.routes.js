const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const { AppError } = require('../utils/errors');
const vapesService = require('../services/vapes.service');

const vapeSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  brand: z.string().trim().min(2, 'La marca debe tener al menos 2 caracteres').max(50),
  price: z.number().int().positive('El precio debe ser un número entero positivo'),
  oldPrice: z.number().int().nonnegative().optional().default(0),
  image: z.string().trim().optional(),
  badge: z.string().trim().optional().default(''),
  category: z.enum(['pods', 'desechables', 'liquidos', 'sales', 'accesorios', 'wax', 'cannabis']),
  rating: z.number().int().min(1).max(5).optional().default(5),
  stock: z.number().int().nonnegative().optional().default(10),
  isNew: z.boolean().optional().default(false),
  isTop: z.boolean().optional().default(false),
});

const vapeUpdateSchema = vapeSchema.partial();

router.param('id', (req, res, next, value) => {
  const id = Number(value);
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(id)) {
    return next(new AppError(400, 'ID de producto inválido'));
  }
  req.productoId = id;
  next();
});

/**
 * @openapi
 * /api/vapes:
 *   get:
 *     summary: Listar productos de VapeKing con filtros y ordenamiento
 *     tags: [VapeKing - Productos]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema: { type: string }
 *         description: Filtrar por categoría (pods, desechables, liquidos, sales, accesorios, wax, cannabis)
 *       - in: query
 *         name: marca
 *         schema: { type: string }
 *         description: Filtrar por marca (Vapo, Geek, Elf, Smok, etc.)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda por nombre o marca
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [featured, price-low, price-high, rating] }
 *         description: Criterio de ordenamiento
 *       - in: query
 *         name: destacados
 *         schema: { type: boolean }
 *         description: Solo productos top/destacados
 *       - in: query
 *         name: nuevos
 *         schema: { type: boolean }
 *         description: Solo productos recién llegados
 *     responses:
 *       200:
 *         description: Catálogo de productos filtrado
 */
router.get('/', (req, res) => {
  const resultado = vapesService.listar(req.query);
  res.json(resultado);
});

/**
 * @openapi
 * /api/vapes/meta/marcas:
 *   get:
 *     summary: Lista de marcas disponibles con conteo de productos
 *     tags: [VapeKing - Metadata]
 *     responses:
 *       200:
 *         description: Lista de marcas
 */
router.get('/meta/marcas', (req, res) => {
  res.json(vapesService.obtenerMarcas());
});

/**
 * @openapi
 * /api/vapes/meta/categorias:
 *   get:
 *     summary: Lista de categorías con conteo de productos
 *     tags: [VapeKing - Metadata]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/meta/categorias', (req, res) => {
  res.json(vapesService.obtenerCategorias());
});

/**
 * @openapi
 * /api/vapes/meta/estadisticas:
 *   get:
 *     summary: Estadísticas generales de inventario
 *     tags: [VapeKing - Metadata]
 *     responses:
 *       200:
 *         description: Estadísticas de productos y valor en CRC
 */
router.get('/meta/estadisticas', (req, res) => {
  res.json(vapesService.obtenerEstadisticas());
});

/**
 * @openapi
 * /api/vapes/{id}:
 *   get:
 *     summary: Obtener detalle de un producto por ID
 *     tags: [VapeKing - Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detalle del producto
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', (req, res) => {
  const prod = vapesService.buscarPorId(req.productoId);
  res.json(prod);
});

/**
 * @openapi
 * /api/vapes:
 *   post:
 *     summary: Crear un nuevo producto en el catálogo
 *     tags: [VapeKing - Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, brand, price, category]
 *             properties:
 *               name: { type: string, example: "Caliburn G5 Ultra" }
 *               brand: { type: string, example: "Uwell" }
 *               price: { type: integer, example: 29500 }
 *               category: { type: string, enum: [pods, desechables, liquidos, sales, accesorios, wax, cannabis], example: "pods" }
 *               stock: { type: integer, example: 15 }
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', validar(vapeSchema), (req, res) => {
  const nuevo = vapesService.crear(req.body);
  res.status(201).json(nuevo);
});

/**
 * @openapi
 * /api/vapes/{id}:
 *   put:
 *     summary: Actualizar un producto existente
 *     tags: [VapeKing - Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price: { type: integer }
 *               stock: { type: integer }
 *               badge: { type: string }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', validar(vapeUpdateSchema), (req, res) => {
  const actualizado = vapesService.actualizar(req.productoId, req.body);
  res.json(actualizado);
});

/**
 * @openapi
 * /api/vapes/{id}:
 *   delete:
 *     summary: Eliminar un producto del catálogo
 *     tags: [VapeKing - Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Producto eliminado (sin contenido)
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:id', (req, res) => {
  vapesService.eliminar(req.productoId);
  res.status(204).end();
});

module.exports = router;
