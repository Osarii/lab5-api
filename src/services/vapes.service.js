const { AppError } = require('../utils/errors');
const initialData = require('../data/vapes.json');

// Catálogo en memoria indexado por ID
let vapesMap = new Map();
let nextId = 1;

function inicializar() {
  vapesMap.clear();
  initialData.forEach((item) => {
    vapesMap.set(item.id, { ...item });
    if (item.id >= nextId) nextId = item.id + 1;
  });
}

inicializar();

/**
 * Lista productos con filtros opcionales de categoría, marca, búsqueda y ordenamiento
 */
function listar({ categoria, marca, search, sort, destacados, nuevos, limit, offset } = {}) {
  let items = [...vapesMap.values()];

  if (categoria && categoria !== 'todos') {
    items = items.filter((p) => p.category.toLowerCase() === categoria.toLowerCase());
  }

  if (marca) {
    items = items.filter((p) => p.brand.toLowerCase() === marca.toLowerCase());
  }

  if (search) {
    const q = search.trim().toLowerCase();
    items = items.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(q));
  }

  if (destacados === 'true' || destacados === true) {
    items = items.filter((p) => p.isTop);
  }

  if (nuevos === 'true' || nuevos === true) {
    items = items.filter((p) => p.isNew);
  }

  if (sort === 'price-low') {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    items.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    items.sort((a, b) => b.rating - a.rating);
  }

  const total = items.length;
  const start = Number(offset) || 0;
  const end = limit ? start + Number(limit) : undefined;
  const data = items.slice(start, end);

  return {
    total,
    productos: data,
  };
}

/**
 * Busca un producto por ID o lanza 404
 */
function buscarPorId(id) {
  const item = vapesMap.get(id);
  if (!item) throw new AppError(404, 'Producto no encontrado');
  return item;
}

/**
 * Crea un nuevo producto
 */
function crear(datos) {
  const nuevo = {
    id: nextId++,
    name: datos.name,
    brand: datos.brand,
    price: datos.price,
    oldPrice: datos.oldPrice || 0,
    image: datos.image || 'assets/catalogo/productos/01-pod-kit-grafito.png',
    badge: datos.badge || '',
    category: datos.category,
    rating: datos.rating || 5,
    stock: datos.stock ?? 10,
    isNew: Boolean(datos.isNew),
    isTop: Boolean(datos.isTop),
  };
  vapesMap.set(nuevo.id, nuevo);
  return nuevo;
}

/**
 * Actualiza un producto existente
 */
function actualizar(id, cambios) {
  const producto = buscarPorId(id);
  const actualizado = {
    ...producto,
    ...cambios,
    id: producto.id, // ID inmutable
  };
  vapesMap.set(id, actualizado);
  return actualizado;
}

/**
 * Elimina un producto por ID
 */
function eliminar(id) {
  buscarPorId(id); // Lanza 404 si no existe
  vapesMap.delete(id);
}

/**
 * Obtiene lista única de marcas con conteo
 */
function obtenerMarcas() {
  const counts = {};
  for (const p of vapesMap.values()) {
    counts[p.brand] = (counts[p.brand] || 0) + 1;
  }
  return Object.entries(counts).map(([marca, cantidad]) => ({ marca, cantidad }));
}

/**
 * Obtiene lista única de categorías con conteo
 */
function obtenerCategorias() {
  const counts = {};
  for (const p of vapesMap.values()) {
    counts[p.category] = (counts[p.category] || 0) + 1;
  }
  return Object.entries(counts).map(([categoria, cantidad]) => ({ categoria, cantidad }));
}

/**
 * Métricas generales del inventario
 */
function obtenerEstadisticas() {
  const todos = [...vapesMap.values()];
  const totalStock = todos.reduce((sum, p) => sum + p.stock, 0);
  const valorInventario = todos.reduce((sum, p) => sum + (p.price * p.stock), 0);
  return {
    totalProductos: todos.length,
    totalStock,
    valorInventarioCRC: valorInventario,
  };
}

module.exports = {
  inicializar,
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
  obtenerMarcas,
  obtenerCategorias,
  obtenerEstadisticas,
};
