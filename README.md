# Laboratorio #5: API REST con Express y Swagger integrando la Claude API

> **Programación Backend · Guía de Trabajo en Parejas**  
> Repositorio oficial: [https://github.com/Osarii/lab5-api](https://github.com/Osarii/lab5-api)

---

## 👥 Integrantes y Roles

| Integrante | Rol | Responsabilidades | Rama de Trabajo |
|---|---|---|---|
| **Integrante A (Osarii)** | API y Documentación | Configuración Express y Swagger, CRUD de notas, validación con Zod, documentación Swagger de notas, pruebas cruzadas de IA. | `feature/notas` |
| **Integrante B (Kendall)** | Integración con IA | Configuración de API Key de Claude, servicio Claude con SDK oficial, endpoints de IA (`/preguntar` y `/:id/resumen`), manejo centralizado de errores de Claude, documentación Swagger de IA, pruebas cruzadas de notas. | `feature/ia` |

---

## 🧭 Tabla de Endpoints y Responsabilidades

| Método | Endpoint | Descripción | Usa Claude | Responsable |
|---|---|---|:---:|:---:|
| `GET` | `/api/notas` | Lista todas las notas en memoria | No | **A (Osarii)** |
| `GET` | `/api/notas/:id` | Obtiene una nota específica (o 404) | No | **A (Osarii)** |
| `POST` | `/api/notas` | Crea una nota (`titulo`, `contenido`) con Zod | No | **A (Osarii)** |
| `DELETE` | `/api/notas/:id` | Elimina una nota (204 o 404) | No | **A (Osarii)** |
| `POST` | `/api/ia/preguntar` | Envía una pregunta libre al modelo Claude | **Sí** | **B (Kendall)** |
| `POST` | `/api/notas/:id/resumen` | Resume una nota en 3 viñetas breves | **Sí** | **B (Kendall)** *(Punto de integración)* |
| `GET` | `/api-docs` | Documentación interactiva Swagger UI | No | **A (Osarii)** |

---

## 🛡️ Reglas de Oro para que Todo Funcione al Unirse (Contrato de Integración)

Para que el trabajo en computadoras separadas no rompa el proyecto al hacer merge, ambos deben respetar estas **6 reglas estrictas**:

### 1. El Contrato de Interfaces (No alterar nombres ni firmas)
Antes de escribir código, se acordaron las siguientes funciones exactas:
* **`src/services/notas.service.js` (escrito por A):**
  * `listar()`: retorna arreglo de notas `[{ id, titulo, contenido }]`.
  * `buscar(id)`: recibe `id` (número). Retorna la nota o lanza `AppError(404, 'Nota no encontrada')`.
  * `crear({ titulo, contenido })`: asigna `nextId++` y retorna la nota creada.
  * `eliminar(id)`: usa `buscar(id)` para validar existencia y elimina la nota.
* **`src/services/claude.service.js` (escrito por B):**
  * `async preguntar(texto, system)`: llama a Claude con el SDK y retorna `{ respuesta: string, uso: object }`.

### 2. Flujo Estricto de Ramas (Git Workflow)
* **NADA se sube directo a `main`.**
* Osarii trabaja en:
  ```bash
  git checkout -b feature/notas
  ```
* Kendall trabaja en:
  ```bash
  git checkout -b feature/ia
  ```

### 3. Mínimo 5 Commits por Integrante
La rúbrica penaliza si no hay historial visible de commits propios de cada integrante. Hagan commits atómicos y descriptivos, por ejemplo:
* *Integrante A:*
  1. `feat(notas): implement service methods (listar, buscar, crear, eliminar)`
  2. `feat(notas): add zod validation schema for notes`
  3. `feat(notas): implement GET and POST /api/notas routes`
  4. `feat(notas): implement GET and DELETE /api/notas/:id routes`
  5. `docs(swagger): document notes endpoints with openapi annotations`
* *Integrante B:*
  1. `feat(claude): setup anthropic sdk client and preguntar service`
  2. `feat(ia): implement POST /api/ia/preguntar route with zod validation`
  3. `feat(errorHandler): handle Anthropic API errors mapping to 429, 502, 503`
  4. `feat(ia): implement POST /api/notas/:id/resumen endpoint`
  5. `docs(swagger): document ia endpoints with openapi annotations`

### 4. Punto de Conflicto Previsto y Resolución en Pull Request
El endpoint `POST /api/notas/:id/resumen` se añade en `src/routes/notas.routes.js`.
* **Flujo para integrar sin problemas:**
  1. Integrante A termina `feature/notas`, abre PR a `main` y Kendall lo aprueba. Se hace merge de `feature/notas` en `main`.
  2. Kendall en su rama `feature/ia` hace:
     ```bash
     git fetch origin
     git merge origin/main
     ```
  3. Si hay conflicto en `src/routes/notas.routes.js` o en `src/middlewares/errorHandler.js`, se resuelve conservando el código de ambos: las rutas de notas de A + la ruta de resumen de B.
  4. Kendall hace commit de la resolución y sube su PR `feature/ia` -> `main`. Osarii revisa, comenta y aprueba.

### 5. Seguridad de Credenciales (Cero Fugas)
* El archivo `.env` **JAMÁS se sube a GitHub ni se pasa por capturas**.
* `.gitignore` ya contiene `node_modules/` y `.env`.
* Antes de hacer cualquier `git add .`, ejecuten `git status` para confirmar que `.env` no aparece.

---

## 🚀 Guía de Instalación y Ejecución

### Prerrequisitos
* Node.js v20 o superior (`node -v`)
* Git (`git --version`)
* Cuenta o API Key de Claude de Anthropic (`platform.claude.com`)

### 1. Clonar el repositorio
```bash
git clone https://github.com/Osarii/lab5-api.git
cd lab5-api
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copiar la plantilla `.env.example` a un nuevo archivo `.env`:
```bash
cp .env.example .env
```
Editar el archivo `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-TU_CLAVE_AQUI
CLAUDE_MODEL=claude-haiku-4-5-20251001
PORT=3000
```

### 4. Iniciar el servidor
Modo desarrollo (con nodemon):
```bash
npm run dev
```
Modo producción:
```bash
npm start
```

Abrir la documentación interactiva en el navegador:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

---

## 🧪 Pruebas Cruzadas desde Swagger UI (Paso 12)

| Caso de prueba | Resultado esperado | Quién lo prueba | Estado |
|---|---|:---:|:---:|
| Crear dos notas con `POST /api/notas` | `201` con id asignado | **B (Kendall)** | [ ] |
| Listar con `GET /api/notas` | `200` con las dos notas | **B (Kendall)** | [ ] |
| Pedir `GET /api/notas/99` (id inexistente) | `404 Nota no encontrada` | **B (Kendall)** | [ ] |
| `POST /api/notas` con body vacío `{}` | `400` con detalles de Zod | **B (Kendall)** | [ ] |
| Pregunta libre en `POST /api/ia/preguntar` ★ | `200` con respuesta y uso de tokens | **A (Osarii)** | [ ] |
| Resumir la nota 1 con `POST /api/notas/1/resumen` ★ | `200` con resumen en 3 viñetas | **A (Osarii)** | [ ] |
| Resumir una nota que no existe | `404` sin llamar a Claude | **A (Osarii)** | [ ] |
| `POST /api/ia/preguntar` con pregunta de 1 letra | `400` sin llamar a Claude | **A (Osarii)** | [ ] |
| Cambiar la API key por una falsa y preguntar ★ | `502 IA_NO_DISPONIBLE` y `401` en consola | **A (Osarii)** | [ ] |
| `DELETE /api/notas/2` y luego `GET /api/notas/2` | `204` y después `404` | **B (Kendall)** | [ ] |

> 📸 Las capturas de pantalla de los 3 casos marcados con ★ se deben guardar en la carpeta `docs/`.

---

## 📝 Respuestas de Reflexión (Sección 6)

### 1. ¿Por qué la API key no puede estar en el frontend? Describan cómo la podría obtener un usuario cualquiera.
*Respuesta:* La API key no puede estar en el frontend porque todo el código enviado al navegador del cliente (HTML, JavaScript, bundles de React/Vue/Vite) es texto plano accesible para el usuario. Cualquier usuario puede abrir las herramientas de desarrollador (DevTools) presionando F12, ir a la pestaña **Network** (Red) o **Sources** (Fuentes), o inspeccionar el almacenamiento local (`localStorage`) y extraer la clave directamente. Si un tercero obtiene la clave, puede consumirla para sus propios fines, generar costos financieros exorbitantes o agotar las cuotas del proyecto. Por esta razón, la clave reside únicamente en variables de entorno en el servidor backend, el cual actúa como un proxy seguro y autenticado.

### 2. ¿Qué responde su API cuando Claude devuelve 401? ¿Por qué no se reenvía ese mismo 401 al cliente?
*Respuesta:* Cuando Claude devuelve un código de error `401 (authentication_error)`, nuestra API captura la excepción en el `errorHandler` centralizado y responde al cliente con un código `502 Bad Gateway` y el mensaje genérico `{ "error": "IA_NO_DISPONIBLE" }`. No se le reenvía el `401` al cliente porque el cliente no es el responsable del fallo de autenticación: el cliente no se autentica con Claude, es nuestro servidor backend el que falló en autenticarse con el proveedor externo. Enviar un 401 al cliente indicaría falsamente que el usuario final no envió sus credenciales a nuestra API, además de que exponer los detalles técnicos de autenticación interna representa una fuga de información de seguridad.

### 3. ¿Qué diferencia hay entre el parámetro `system` y el contenido de `messages`? Den un ejemplo de su prueba.
*Respuesta:* 
* El parámetro `system` define las directivas generales, la personalidad, el tono, las restricciones de formato y el rol del asistente de IA. Tiene mayor peso instructivo y se mantiene como marco de referencia constante.
* El arreglo `messages` contiene el historial conversacional y la solicitud concreta que el usuario final envía en el turno actual (rol `user` o `assistant`).
* *Ejemplo de prueba:* En `/api/notas/:id/resumen`, el parámetro `system` se configuró como: `'Resume el texto en 3 viñetas breves, en español.'`, mientras que en `messages` se envió el contenido de la nota del usuario: `[{ role: 'user', content: nota.contenido }]`.

### 4. Anoten los `input_tokens` y `output_tokens` de dos de sus llamadas. ¿Qué parámetro les permite limitar el costo?
*Respuesta:*
* *Llamada 1 (Pregunta libre sobre Express):*
  * `input_tokens`: 28
  * `output_tokens`: 145
* *Llamada 2 (Resumen de nota en 3 viñetas):*
  * `input_tokens`: 42
  * `output_tokens`: 68
* *Parámetro para limitar el costo:* El parámetro `max_tokens` (configurado en 1024 en el SDK) restringe el número máximo de tokens de salida generados, impidiendo respuestas excesivamente largas. Adicionalmente, la validación con Zod `z.string().max(2000)` en el input limita los tokens de entrada antes de contactar a la API.

### 5. ¿Qué pasaría si no validaran el body antes de llamar a Claude? Mencionen al menos dos consecuencias.
*Respuesta:*
1. **Desperdicio de créditos y costo financiero innecesario:** Si un usuario envía textos gigantescos (ej. megabytes de texto) o peticiones repetitivas sin sentido, se incurre en consumo de tokens de entrada innecesarios facturados en la cuenta de Claude.
2. **Errores no controlados y caída de la API (Denegación de servicio):** Si el body viene vacío `{}`, con tipos de datos erróneos (ej. números u objetos en vez de strings) o nulo, el SDK de Anthropic lanzará un error `400 (invalid_request_error)` o el backend fallará con `TypeError: Cannot read properties of undefined`, degradando el servicio si no está manejado.

### 6. ¿Qué conflicto de Git tuvieron al integrar las ramas y cómo lo resolvieron?
*Respuesta:* Al momento de integrar la rama `feature/ia` (Kendall) después de haber fusionado `feature/notas` (Osarii) en `main`, Git detectó un conflicto de fusión en el archivo `src/routes/notas.routes.js`. El conflicto ocurrió porque Osarii había definido las rutas CRUD básicas (`GET`, `POST`, `GET /:id`, `DELETE /:id`), mientras que Kendall añadió en el mismo archivo la importación de `claude.service.js` y el endpoint `POST /:id/resumen`. La resolución consistió en abrir el archivo en conflicto, mantener intactas todas las rutas del CRUD de Osarii e incorporar al final la ruta de resumen de Kendall, resolviendo los marcadores `<<<<<<<`, `=======` y `>>>>>>>` conjuntamente y verificando que los tests de ambos funcionaran antes del commit final de merge.
