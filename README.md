# Laboratorio 5 — Notas + DeepSeek

Adaptación funcional del laboratorio suministrado: Express 5, validación Zod, notas en memoria, preguntas y resúmenes con DeepSeek, y Swagger UI.

Integrantes según el material original: Osarii (A: notas y documentación), Kendall (B: IA). Confirmar los nombres antes de entregar.

## Ejecutar

Requisito: Node.js 20 o superior.

```bash
npm ci
cp .env.example .env
# Editar .env y colocar DEEPSEEK_API_KEY
npm start
```

En PowerShell, usar `Copy-Item .env.example .env`.
Abrir http://localhost:3000/api-docs y probar con “Try it out”. `npm run dev` activa recarga; `npm test` ejecuta las pruebas sin créditos.

Crear la clave en https://platform.deepseek.com/api_keys y verificar saldo. La suscripción de chat no sustituye los créditos de API. No colocar la clave en Swagger, código, capturas ni Git.

| Variable | Uso |
|---|---|
| DEEPSEEK_API_KEY | Clave privada del backend |
| DEEPSEEK_MODEL | Modelo; ejemplo predeterminado en .env.example |
| PORT | Puerto local; 3000 por defecto |

El modelo predeterminado es `deepseek-flash`, comprobado en la documentación oficial consultada el 11/11/2026: https://api-docs.deepseek.com/. Las solicitudes usan `POST https://api.deepseek.com/chat/completions`, mensajes system/user, `thinking: {type: 'disabled'}`, `max_tokens: 1024` y timeout de 30 segundos. Se usa `fetch` nativo de Node, sin SDK Anthropic. El modelo se puede cambiar en .env. El proveedor determina los precios y disponibilidad.

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | /api/notas | 200, lista |
| POST | /api/notas | 201, nota creada |
| GET | /api/notas/:id | 200, nota |
| DELETE | /api/notas/:id | 204, sin cuerpo |
| POST | /api/ia/preguntar | 200, respuesta y uso |
| POST | /api/notas/:id/resumen | 200, notaId y resumen |
| GET | /api-docs | Swagger UI |

La especificación completa está en `src/config/openapi.json` y se publica en `/api-docs.json`. Contiene esquemas, cuerpos, respuestas y errores. Se centralizó en OpenAPI JSON para que sea editable sin depender de comentarios YAML.

Crear una nota con:
```json
{"titulo":"Reunión","contenido":"Revisar la base de datos. Configurar la API. Desplegar a pruebas."}
```
Después ejecutar `POST /api/notas/1/resumen`. Para preguntar:
```json
{"pregunta":"¿Qué es Express.js?"}
```

Notas: título de 1–100 caracteres y contenido de 1–5000. Preguntas: 3–2000 caracteres. Se recortan espacios. IDs enteros positivos. Las notas desaparecen al reiniciar. El resumen solicita tres viñetas al modelo; el texto generado depende del proveedor.

## Errores

- 400: body inválido, JSON mal formado o ID inválido.
- 404: nota o ruta inexistente.
- 413: cuerpo demasiado grande.
- 429: límite del proveedor.
- 502: DeepSeek rechaza la solicitud (incluidos 401 y saldo insuficiente), falla la conexión o devuelve contenido inválido/truncado.
- 503: clave ausente (`IA_NO_CONFIGURADA`), timeout o servicio no disponible.

Los fallos del proveedor responden `{ "error": "IA_NO_DISPONIBLE" }`; la consola solo registra el código. Las validaciones ocurren antes de llamar al proveedor.

## Verificación y evidencia

`npm test` comprueba el flujo HTTP real de Express y simula solamente la frontera con DeepSeek. Incluye creación/listado/consulta/eliminación, validaciones, pregunta, resumen, no llamar a IA ante entradas inválidas, códigos externos, ausencia de clave, JSON incorrecto y disponibilidad de Swagger. Ver `docs/VERIFICACION.md`.

No se efectuaron llamadas reales: no se suministró API key. Las respuestas y tokens de pruebas son simulados. Para la evidencia académica, capturar en Swagger la pregunta real, el resumen real y el error con clave inválida; guardar en docs sin mostrar credenciales. Las capturas locales incluidas, si las hay, prueban solo la documentación.

## Reflexión

1. Una clave en frontend se obtiene inspeccionando JavaScript, recursos descargados o solicitudes en DevTools. Por eso queda exclusivamente en el backend.
2. Un 401 de DeepSeek se traduce a 502: es un fallo de autenticación entre nuestro servidor y el proveedor, no una solicitud de inicio de sesión del usuario de esta API. No se divulgan detalles internos.
3. `system` define la tarea y el comportamiento; el mensaje `user` contiene la pregunta o el texto. Para preguntas se pide responder en español y para resúmenes se solicitan tres viñetas. Cambiar la instrucción del sistema a “resume en una frase” o “extrae palabras clave” cambia el formato esperado de la respuesta.
4. DeepSeek reporta `prompt_tokens`, `completion_tokens` y `total_tokens` en `uso`. `max_tokens` limita la salida y la validación limita la entrada, por lo que ambas medidas ayudan a controlar el consumo. Las pruebas automatizadas usan una respuesta simulada; cualquier registro de consumo real debe capturarse durante una ejecución con una clave válida, sin publicar la clave.
5. Sin validar se podrían gastar créditos en preguntas vacías o enormes y enviar tipos incorrectos que causen fallos externos. También se deteriora la experiencia del cliente.
6. La integración conserva las rutas CRUD y añade el resumen compartiendo `notas.buscar(id)` y `deepseek.preguntar`. Si Git reporta conflictos al integrar ramas, se deben resolver conservando ambos contratos y documentar la solución efectivamente aplicada.

## Alcance académico y Git

El PDF original se conserva como referencia: exige Claude y el SDK Anthropic. Esta variante usa DeepSeek por petición del usuario; el docente debe aceptar esa sustitución para evaluar el criterio correspondiente.

La rama `feature/ia` contiene la implementación, sus pruebas y los cambios documentados en commits separados. La clave permanece únicamente en `.env`, que está ignorado por Git. Los requisitos de trabajo en pareja, revisión del compañero y coevaluación requieren acciones reales de los integrantes. Ver `INSTRUCCIONES_AGENTE_KENDALL.md`.
