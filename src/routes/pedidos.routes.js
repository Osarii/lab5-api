const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const pedidosService = require('../services/pedidos.service');

const pedidoSchema = z.object({
  cliente: z.object({
    nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres'),
    telefono: z.string().trim().min(8, 'El teléfono debe tener al menos 8 dígitos'),
    email: z.string().trim().email('Correo electrónico inválido'),
    direccion: z.string().trim().min(5, 'Dirección de entrega requerida'),
    provincia: z.string().trim().optional().default('San José'),
  }),
  items: z.array(z.object({
    id: z.number().int().positive('ID de producto inválido'),
    cantidad: z.number().int().positive('La cantidad debe ser mayor a 0').optional().default(1),
  })).min(1, 'El pedido debe incluir al menos un producto'),
  metodoPago: z.enum(['SINPE', 'TARJETA', 'CONTRA_ENTREGA']).optional().default('SINPE'),
  notas: z.string().trim().optional().default(''),
});

const estadoSchema = z.object({
  estado: z.enum(['RECIBIDO', 'PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']),
});

/**
 * @openapi
 * /api/pedidos:
 *   post:
 *     summary: Procesar orden de compra (Checkout) en VapeKing CR
 *     tags: [VapeKing - Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cliente, items]
 *             properties:
 *               cliente:
 *                 type: object
 *                 required: [nombre, telefono, email, direccion]
 *                 properties:
 *                   nombre: { type: string, example: "Carlos Mora" }
 *                   telefono: { type: string, example: "8888-1234" }
 *                   email: { type: string, example: "carlos@gmail.com" }
 *                   direccion: { type: string, example: "San Pedro, 200m este del parque" }
 *                   provincia: { type: string, example: "San José" }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id, cantidad]
 *                   properties:
 *                     id: { type: integer, example: 1 }
 *                     cantidad: { type: integer, example: 2 }
 *               metodoPago: { type: string, enum: [SINPE, TARJETA, CONTRA_ENTREGA], example: "SINPE" }
 *     responses:
 *       201:
 *         description: Pedido procesado exitosamente
 *       400:
 *         description: Datos inválidos o stock insuficiente
 */
router.post('/', validar(pedidoSchema), (req, res) => {
  const nuevoPedido = pedidosService.crearPedido(req.body);
  res.status(201).json(nuevoPedido);
});

/**
 * @openapi
 * /api/pedidos:
 *   get:
 *     summary: Listar todos los pedidos recibidos
 *     tags: [VapeKing - Pedidos]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/', (req, res) => {
  res.json(pedidosService.listarPedidos());
});

/**
 * @openapi
 * /api/pedidos/{codigo}:
 *   get:
 *     summary: Consultar un pedido por su código (ej. VK-CR-1001)
 *     tags: [VapeKing - Pedidos]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:codigo', (req, res) => {
  res.json(pedidosService.buscarPedido(req.params.codigo));
});

/**
 * @openapi
 * /api/pedidos/{codigo}/estado:
 *   patch:
 *     summary: Actualizar estado de entrega o pago del pedido
 *     tags: [VapeKing - Pedidos]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: string, enum: [RECIBIDO, PAGADO, PREPARANDO, ENVIADO, ENTREGADO, CANCELADO] }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Pedido no encontrado
 */
router.patch('/:codigo/estado', validar(estadoSchema), (req, res) => {
  res.json(pedidosService.actualizarEstado(req.params.codigo, req.body.estado));
});

module.exports = router;
