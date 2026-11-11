const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const realFetch = global.fetch;
let server, base, calls = [], providerStatus = 200;
before(async () => {
  process.env.DEEPSEEK_API_KEY = 'clave-simulada';
  global.fetch = async (url, options) => {
    if (!String(url).startsWith('https://api.deepseek.com/')) return realFetch(url, options);
    calls.push(JSON.parse(options.body));
    return new Response(JSON.stringify(providerStatus === 200 ? {
      choices: [{ message: { content: '- Uno\n- Dos\n- Tres' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 12, completion_tokens: 9, total_tokens: 21 },
    } : { error: { message: 'SECRETO DEL PROVEEDOR' } }), { status: providerStatus });
  };
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { global.fetch = realFetch; await new Promise(resolve => server.close(resolve)); });
async function request(path, method = 'GET', body) {
  return realFetch(base + path, { method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body) });
}
test('CRUD completo, validación y errores', async () => {
  assert.equal((await request('/api/notas', 'POST', {})).status, 400);
  const a = await request('/api/notas', 'POST', { titulo: 'Reunión', contenido: 'Revisar API, datos y despliegue.' });
  assert.equal(a.status, 201); const nota = await a.json();
  assert.equal((await request('/api/notas', 'POST', { titulo: 'Dos', contenido: 'Otra nota' })).status, 201);
  assert.equal((await (await request('/api/notas')).json()).length, 2);
  assert.deepEqual(await (await request(`/api/notas/${nota.id}`)).json(), nota);
  assert.equal((await request('/api/notas/99')).status, 404);
  assert.equal((await request('/api/notas/1.5')).status, 400);
  assert.equal((await request('/api/notas/2', 'DELETE')).status, 204);
  assert.equal((await request('/api/notas/2')).status, 404);
});
test('preguntar y resumir usan el contrato de DeepSeek', async () => {
  const r = await request('/api/ia/preguntar', 'POST', { pregunta: '¿Qué es Express?' });
  assert.equal(r.status, 200); assert.equal((await r.json()).uso.total_tokens, 21);
  assert.equal(calls.at(-1).messages[0].role, 'system');
  assert.equal(calls.at(-1).messages[1].content, '¿Qué es Express?');
  const resumen = await request('/api/notas/1/resumen', 'POST');
  assert.equal(resumen.status, 200); assert.equal((await resumen.json()).notaId, 1);
  assert.match(calls.at(-1).messages[0].content, /3 viñetas/);
  const count = calls.length;
  assert.equal((await request('/api/ia/preguntar', 'POST', { pregunta: 'x' })).status, 400);
  assert.equal((await request('/api/ia/preguntar', 'POST', { pregunta: '   ' })).status, 400);
  assert.equal((await request('/api/notas/99/resumen', 'POST')).status, 404);
  assert.equal(calls.length, count);
});
test('errores externos seguros y clave ausente', async () => {
  for (const [upstream, expected] of [[401,502],[402,502],[429,429],[500,502],[503,503],[529,503]]) {
    providerStatus = upstream;
    const r = await request('/api/ia/preguntar', 'POST', { pregunta: 'Pregunta válida' });
    assert.equal(r.status, expected); assert.deepEqual(await r.json(), { error: 'IA_NO_DISPONIBLE' });
  }
  providerStatus = 200;
  delete process.env.DEEPSEEK_API_KEY;
  assert.equal((await request('/api/ia/preguntar', 'POST', { pregunta: 'Pregunta válida' })).status, 503);
  process.env.DEEPSEEK_API_KEY = 'clave-simulada';
});
test('JSON inválido y documentación', async () => {
  const r = await realFetch(base + '/api/notas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(r.status, 400);
  assert.equal((await request('/api-docs/')).status, 200);
  const spec = await (await request('/api-docs.json')).json();
  assert.equal(Object.values(spec.paths).reduce((n, path) => n + Object.keys(path).length, 0), 7);
  assert.ok(spec.components.schemas.Nota);
  assert.equal((await request('/no-existe')).status, 404);
});
