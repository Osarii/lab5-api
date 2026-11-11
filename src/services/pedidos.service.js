const { AppError } = require('../utils/errors');
const vapesService = require('./vapes.service');

const pedidosMap = new Map();
let contadorPedidos = 1001;

function crearPedido({ cliente, items, metodoPago = 'SINPE', notas = '' }) {
  if (!items || !items.length) {
    throw new AppError(400, 'El pedido debe incluir al menos un producto');
  }

  const itemsDetallados = [];
  let subtotal = 0;

  // Validar y reservar productos
  for (const item of items) {
    const prod = vapesService.buscarPorId(item.id);
    const cantidad = Number(item.cantidad) || 1;

    if (cantidad <= 0) {
      throw new AppError(400, `Cantidad inválida para producto ID ${item.id}`);
    }

    if (prod.stock < cantidad) {
      throw new AppError(400, `Stock insuficiente para "${prod.name}" (disponibles: ${prod.stock})`);
    }

    const totalLinea = prod.price * cantidad;
    subtotal += totalLinea;

    itemsDetallados.push({
      productoId: prod.id,
      nombre: prod.name,
      marca: prod.brand,
      precioUnitario: prod.price,
      cantidad,
      totalLinea,
    });
  }

  // Descontar stock
  for (const item of itemsDetallados) {
    const prod = vapesService.buscarPorId(item.productoId);
    vapesService.actualizar(prod.id, { stock: prod.stock - item.cantidad });
  }

  // Envío gratis en Costa Rica si compra > ₡10.000
  const costoEnvio = subtotal >= 10000 ? 0 : 2500;
  const total = subtotal + costoEnvio;
  const codigo = `VK-CR-${contadorPedidos++}`;

  const nuevoPedido = {
    codigo,
    fecha: new Date().toISOString(),
    estado: 'RECIBIDO',
    cliente: {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      provincia: cliente.provincia || 'San José',
    },
    items: itemsDetallados,
    subtotal,
    costoEnvio,
    total,
    metodoPago,
    instruccionesPago: metodoPago === 'SINPE'
      ? `Realizar SINPE Móvil al 8888-8888 a nombre de VapeKing CR. Detalle obligatorio: ${codigo}`
      : 'Pago contra entrega o tarjeta procesada.',
    notas,
  };

  pedidosMap.set(codigo, nuevoPedido);
  return nuevoPedido;
}

function listarPedidos() {
  return [...pedidosMap.values()].reverse();
}

function buscarPedido(codigo) {
  const pedido = pedidosMap.get(codigo);
  if (!pedido) throw new AppError(404, 'Pedido no encontrado');
  return pedido;
}

function actualizarEstado(codigo, nuevoEstado) {
  const pedido = buscarPedido(codigo);
  pedido.estado = nuevoEstado;
  return pedido;
}

module.exports = {
  crearPedido,
  listarPedidos,
  buscarPedido,
  actualizarEstado,
};
