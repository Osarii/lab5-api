# 🤖 GUÍA DE MISIÓN PARA EL AGENTE DE IA DE KENDALL (INTEGRANTE B) - VERSIÓN DEEPSEEK

> **Contexto:** Estás ejecutando como el asistente de IA para **Kendall (Integrante B)** en el proyecto **Laboratorio #5: API REST con Express y Swagger integrando DeepSeek API**.
> **Repositorio compartido en GitHub:** [https://github.com/Osarii/lab5-api](https://github.com/Osarii/lab5-api)
> **Compañero (Integrante A):** Osarii (`feature/notas`) ya configuró la base del servidor Express y el CRUD de notas.
> **Tu Rol (Kendall):** Integración con la API de IA (**DeepSeek** vía SDK compatible OpenAI), endpoints de IA (`/api/ia/preguntar` y `/api/notas/:id/resumen`), manejo centralizado de errores y documentación OpenAPI/Swagger.

---

## 🎯 OBJETIVOS DE KENDALL (DEEPSEEK)

1. Trabajar exclusivamente en la rama `feature/ia`.
2. Configurar la API key de DeepSeek en el archivo local `.env` (¡JAMÁS subir `.env` a git!).
3. Implementar o verificar el servicio `src/services/deepseek.service.js` usando el paquete `openai` configurado con `baseURL: 'https://api.deepseek.com'`.
4. Implementar la ruta `POST /api/ia/preguntar` en `src/routes/ia.routes.js` con validación Zod.
5. Implementar el endpoint de integración `POST /api/notas/:id/resumen` en `src/routes/notas.routes.js`.
6. Actualizar el middleware `src/middlewares/errorHandler.js` para capturar `OpenAI.APIError` y responder códigos 429, 502, 503 con el mensaje seguro `{ error: 'IA_NO_DISPONIBLE' }`.
7. Documentar los endpoints con comentarios `@openapi` para Swagger UI.
8. Realizar **al menos 5 commits con mensajes claros y significativos** para cumplir con la rúbrica de evaluación.
9. Integrar los cambios con `main`, resolver el conflicto esperado en `notas.routes.js`, y crear el Pull Request en GitHub.

---

## 📋 PASO 0: VERIFICACIÓN DEL ENTORNO

Antes de escribir código, verifica:
```bash
# 1. Asegúrate de estar en la rama de Kendall
git checkout feature/ia

# 2. Instalar dependencias (incluye express, openai, zod, swagger, etc.)
npm install

# 3. Crear el archivo .env a partir de .env.example
cp .env.example .env
```

En `.env`, Kendall debe colocar su API key real de DeepSeek:
```env
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com
PORT=3000
```
> ⚠️ **REGLA DE SEGURIDAD CRÍTICA:** Antes de cualquier commit, verifica con `git status` que `.env` **NO** figure en la lista. Si la API key se sube a Git, la nota en seguridad es 0 puntos.

---

## 💻 CÓDIGO EXACTO A IMPLEMENTAR

### 1. `src/services/deepseek.service.js`
```javascript
const OpenAI = require('openai');

function getClient() {
  return new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || 'missing-key',
  });
}

/**
 * Envía un mensaje a DeepSeek usando chat.completions.create
 * @param {string} texto - Contenido del mensaje del usuario
 * @param {string} [system] - Directiva de sistema opcional (rol, formato, etc.)
 * @returns {Promise<{ respuesta: string, uso: object }>}
 */
async function preguntar(texto, system) {
  const client = getClient();
  const messages = [];

  if (system) {
    messages.push({ role: 'system', content: system });
  } else {
    messages.push({ role: 'system', content: 'Eres un asistente útil. Responde en español.' });
  }

  messages.push({ role: 'user', content: texto });

  const completion = await client.chat.completions.create({
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    max_tokens: 1024,
    messages,
  });

  const respuesta = completion.choices?.[0]?.message?.content ?? '';
  return {
    respuesta,
    uso: completion.usage,
  };
}

module.exports = { preguntar, getClient };
```

---

### 2. `src/routes/ia.routes.js`
```javascript
const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const deepseek = require('../services/deepseek.service');

const preguntaSchema = z.object({
  pregunta: z.string().min(3, 'La pregunta debe tener al menos 3 caracteres').max(2000, 'La pregunta no puede superar los 2000 caracteres'),
});

/**
 * @openapi
 * /api/ia/preguntar:
 *   post:
 *     summary: Envía una pregunta libre a DeepSeek
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pregunta'
 *     responses:
 *       200:
 *         description: Respuesta del modelo y consumo de tokens
 *       400:
 *         description: Datos inválidos o fuera de rango (Zod)
 *       502:
 *         description: DeepSeek no disponible
 */
router.post('/preguntar', validar(preguntaSchema), async (req, res, next) => {
  try {
    const r = await deepseek.preguntar(req.body.pregunta);
    res.json(r);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

---

### 3. `src/middlewares/errorHandler.js`
```javascript
const OpenAI = require('openai');
const { AppError } = require('../utils/errors');

module.exports = (err, req, res, next) => {
  // Errores operacionales de la aplicación (ej: 404 Nota no encontrada)
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Errores de DeepSeek API
  if (err instanceof OpenAI.APIError) {
    console.error('DeepSeek API:', err.status, err.message);
    const status = err.status === 429 ? 429
      : (err.status === 529 || err.status === 503 || err.status === 500) ? 503
      : 502;
    return res.status(status).json({ error: 'IA_NO_DISPONIBLE' });
  }

  // Cualquier otro error imprevisto
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
};
```

---

### 4. Endpoint de integración en `src/routes/notas.routes.js`
Añadir la importación de `deepseek.service` y el endpoint `POST /:id/resumen`:

Al inicio del archivo:
```javascript
const deepseek = require('../services/deepseek.service');
```

Antes de `module.exports = router;`:
```javascript
/**
 * @openapi
 * /api/notas/{id}/resumen:
 *   post:
 *     summary: Resume una nota en 3 viñetas breves usando DeepSeek
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la nota a resumir
 *     responses:
 *       200:
 *         description: Resumen generado con éxito
 *       404:
 *         description: Nota no encontrada
 *       502:
 *         description: DeepSeek no disponible
 */
router.post('/:id/resumen', async (req, res, next) => {
  try {
    const nota = notas.buscar(Number(req.params.id)); // 404 automático si no existe
    const r = await deepseek.preguntar(
      nota.contenido,
      'Resume el texto en 3 viñetas breves, en español.'
    );
    res.json({ notaId: nota.id, resumen: r.respuesta });
  } catch (err) {
    next(err);
  }
});
```

---

## 🏷️ SECUENCIA DE 5 COMMITS PARA KENDALL (RÚBRICA OBLIGATORIA)

```bash
# Commit 1: Servicio de DeepSeek
git add src/services/deepseek.service.js
git commit -m "feat(deepseek): setup OpenAI-compatible client for DeepSeek API"

# Commit 2: Ruta POST /api/ia/preguntar
git add src/routes/ia.routes.js
git commit -m "feat(ia): implement POST /api/ia/preguntar with zod validation schema"

# Commit 3: Manejo de errores de DeepSeek API
git add src/middlewares/errorHandler.js
git commit -m "feat(errorHandler): add DeepSeek API error handling mapping 429, 502, 503"

# Commit 4: Endpoint de integración POST /api/notas/:id/resumen
git add src/routes/notas.routes.js
git commit -m "feat(ia): implement POST /api/notas/:id/resumen integrating notas and deepseek"

# Commit 5: Documentación Swagger OpenAPI
git add src/routes/ia.routes.js src/routes/notas.routes.js
git commit -m "docs(swagger): add openapi annotations and schemas for IA endpoints"
```

---

## 🔄 INTEGRACIÓN Y RESOLUCIÓN DE CONFLICTOS

1. Asegúrate de que el PR #1 de Osarii (`feature/notas`) haya sido aprobado y mergeado a `main`.
2. Descarga los últimos cambios de `main`:
   ```bash
   git fetch origin
   git merge origin/main
   ```
3. **Resolución del conflicto en `src/routes/notas.routes.js`:**
   Asegúrate de mantener:
   - Los requires de ambos (`z`, `validar`, `notas` y `deepseek`).
   - El `notaSchema`.
   - Las rutas del CRUD de Osarii (`GET /`, `POST /`, `GET /:id`, `DELETE /:id`).
   - La ruta de resumen de Kendall (`POST /:id/resumen`).
4. Guarda el archivo resuelto y haz commit del merge:
   ```bash
   git add src/routes/notas.routes.js
   git commit -m "chore(merge): resolve integration conflict in notas.routes.js"
   ```
5. Sube tu rama a GitHub:
   ```bash
   git push -u origin feature/ia
   ```
6. En GitHub, abre el **Pull Request de `feature/ia` hacia `main`** para que Osarii lo revise y apruebe.

---

## 🧪 VERIFICACIÓN Y PRUEBAS

Ejecuta:
```bash
npm run dev
```
Abre en el navegador: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Prueba:
1. `POST /api/notas` con `{"titulo": "Reunión", "contenido": "Punto 1 revisar base de datos. Punto 2 configurar api. Punto 3 desplegar a pruebas."}`
2. `POST /api/notas/1/resumen` -> Debe devolver el resumen en 3 viñetas.
3. `POST /api/ia/preguntar` con `{"pregunta": "¿Qué es Express.js?"}` -> Debe devolver la respuesta de DeepSeek y el conteo de tokens.
4. Prueba con una API key inválida en `.env` -> Debe devolver `502 IA_NO_DISPONIBLE` y en la terminal mostrar `DeepSeek API: 401`.
