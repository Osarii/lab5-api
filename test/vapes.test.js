const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const vapesService = require('../src/services/vapes.service');

const realFetch = global.fetch;
let server, base;

before(async () => {
  process.env.DEEPSEEK_API_KEY = 'clave-simulada-vapes';

  global.fetch = async (url, options) => {
    if (!String(url).startsWith('https://api.deepseek.com/')) {
      return realFetch(url, options);
    }
    return new Response(JSON.stringify({
      choices: [{
        message: { content: 'Te recomiendo el Geek Pulse X por su gran autonomía y la Menta Polar 30ml por su frescura.' },
        finish_reason: 'stop',
      }],
      usage: { prompt_tokens: 45, completion_tokens: 30, total_tokens: 75 },
    }), { status: 200 });
  };

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  global.fetch = realFetch;
  await new Promise((resolve) => server.close(resolve));
});

async function request(path, method = 'GET', body) {
  return realFetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test('Frontend estático se sirve en la raíz', async () => {
  const r = await realFetch(base + '/');
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes('VapeKing CR'));
  assert.ok(html.includes('checkout-modal'));
  assert.ok(html.includes('sommelier-modal'));
  assert.ok(html.includes('resumen-modal'));
  assert.ok(html.includes('backend-ui.css'));

  const css = await realFetch(base + '/css/backend-ui.css');
  assert.equal(css.status, 200);
});

test('Catálogo de Vapes: listado, filtros, marcas y estadísticas', async () => {
  vapesService.inicializar(); // reset a 44 productos

  // 1. Listar todo
  const rAll = await (await request('/api/vapes')).json();
  assert.equal(rAll.total, 44);
  assert.equal(rAll.productos.length, 44);

  // 2. Filtrar por categoría
  const rPods = await (await request('/api/vapes?categoria=pods')).json();
  assert.ok(rPods.productos.length > 0);
  assert.ok(rPods.productos.every((p) => p.category === 'pods'));

  // 3. Filtrar por búsqueda
  const rSearch = await (await request('/api/vapes?search=menta')).json();
  assert.ok(rSearch.productos.length >= 1);
  assert.match(rSearch.productos[0].name.toLowerCase(), /menta/);

  // 4. Ordenamiento
  const rSortAsc = await (await request('/api/vapes?sort=price-low')).json();
  assert.ok(rSortAsc.productos[0].price <= rSortAsc.productos[1].price);

  // 5. Metadatos
  const rMarcas = await (await request('/api/vapes/meta/marcas')).json();
  assert.ok(Array.isArray(rMarcas));
  assert.ok(rMarcas.some((m) => m.marca === 'Vapo'));

  const rCategorias = await (await request('/api/vapes/meta/categorias')).json();
  assert.ok(rCategorias.some((c) => c.categoria === 'pods'));

  const rStats = await (await request('/api/vapes/meta/estadisticas')).json();
  assert.equal(rStats.totalProductos, 44);
  assert.ok(rStats.valorInventarioCRC > 0);
});

test('CRUD de Productos en VapeKing', async () => {
  // Crear
  const nuevo = {
    name: 'Pod Mod King Pro',
    brand: 'VapeKing',
    price: 35000,
    category: 'pods',
    stock: 8,
  };
  const rPost = await request('/api/vapes', 'POST', nuevo);
  assert.equal(rPost.status, 201);
  const creado = await rPost.json();
  assert.equal(creado.name, 'Pod Mod King Pro');
  assert.ok(creado.id);

  // Consultar
  const rGet = await request(`/api/vapes/${creado.id}`);
  assert.equal(rGet.status, 200);
  assert.equal((await rGet.json()).brand, 'VapeKing');

  // Actualizar
  const rPut = await request(`/api/vapes/${creado.id}`, 'PUT', { price: 32000, stock: 15 });
  assert.equal(rPut.status, 200);
  const actualizado = await rPut.json();
  assert.equal(actualizado.price, 32000);
  assert.equal(actualizado.stock, 15);

  // Eliminar
  const rDel = await request(`/api/vapes/${creado.id}`, 'DELETE');
  assert.equal(rDel.status, 204);

  // 404 al consultar eliminado
  assert.equal((await request(`/api/vapes/${creado.id}`)).status, 404);
});

test('Procesamiento de Pedidos (Checkout)', async () => {
  vapesService.inicializar();

  const pedidoData = {
    cliente: {
      nombre: 'Valeria Solís',
      telefono: '8765-4321',
      email: 'valeria@gmail.com',
      direccion: 'Curridabat, Pinares, casa 12',
      provincia: 'San José',
    },
    items: [
      { id: 1, cantidad: 1 }, // Vapo Ultra 5000 (₡12.500)
    ],
    metodoPago: 'SINPE',
  };

  const r = await request('/api/pedidos', 'POST', pedidoData);
  assert.equal(r.status, 201);
  const pedido = await r.json();
  assert.ok(pedido.codigo.startsWith('VK-CR-'));
  assert.equal(pedido.subtotal, 12500);
  assert.equal(pedido.costoEnvio, 0); // > ₡10.000 -> gratis
  assert.equal(pedido.total, 12500);
  assert.ok(pedido.instruccionesPago.includes('SINPE'));

  // Consultar por código
  const rGet = await request(`/api/pedidos/${pedido.codigo}`);
  assert.equal(rGet.status, 200);
  assert.equal((await rGet.json()).cliente.nombre, 'Valeria Solís');

  // Actualizar estado
  const rPatch = await request(`/api/pedidos/${pedido.codigo}/estado`, 'PATCH', { estado: 'PAGADO' });
  assert.equal(rPatch.status, 200);
  assert.equal((await rPatch.json()).estado, 'PAGADO');
});

test('Newsletter de VapeKing', async () => {
  const r1 = await request('/api/newsletter', 'POST', { email: 'vaper@cr.com' });
  assert.equal(r1.status, 200);
  const json1 = await r1.json();
  assert.equal(json1.cuponDescuento, 'VAPEKING10');

  const rBad = await request('/api/newsletter', 'POST', { email: 'correo-invalido' });
  assert.equal(rBad.status, 400);

  const rList = await request('/api/newsletter');
  assert.equal(rList.status, 200);
  assert.ok((await rList.json()).suscriptores.includes('vaper@cr.com'));
});

test('Sommelier Virtual IA y Resumen de Productos', async () => {
  // Asistente recomendador
  const rRecomendar = await request('/api/ia/recomendar', 'POST', {
    consulta: '¿Qué me recomiendan para empezar?',
  });
  assert.equal(rRecomendar.status, 200);
  const jsonRec = await rRecomendar.json();
  assert.ok(jsonRec.recomendacion.length > 0);

  // Resumen técnico de producto
  const rResumen = await request('/api/ia/producto/1/resumen', 'POST');
  assert.equal(rResumen.status, 200);
  const jsonRes = await rResumen.json();
  assert.equal(jsonRes.productoId, 1);
  assert.ok(jsonRes.resumen.length > 0);
});
