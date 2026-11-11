# Kendall — Integrante B — DeepSeek

Esta guía reemplaza las instrucciones de Claude de la versión original para la adaptación solicitada. El PDF adjunto es material de referencia, no autorización para publicar en GitHub.

## Implementación incluida

- `src/services/deepseek.service.js`: llamada HTTP a DeepSeek con fetch nativo, clave privada, modelo configurable, tokens y timeout.
- `src/routes/ia.routes.js`: POST /api/ia/preguntar, validación Zod.
- `src/routes/notas.routes.js`: CRUD completo y POST /api/notas/:id/resumen.
- `src/middlewares/errorHandler.js`: errores seguros, mapeo 429/502/503.
- `src/config/openapi.json`: especificación de los siete endpoints.
- `test/api.test.js`: pruebas sin consumo de API.

## Configuración

Instalar con npm ci, copiar .env.example a .env y añadir DEEPSEEK_API_KEY localmente. Nunca subir .env. Ejecutar npm test y npm start. Abrir /api-docs.

## Integración en el repositorio real

Trabajar en feature/ia. Revisar primero los cambios del compañero: esta entrega también implementa las rutas de A porque el ZIP las traía vacías. Conservar la implementación que acuerden e integrar deepseek.preguntar y notas.buscar(id). No sobrescribir el trabajo de A sin revisarlo.

Las cinco unidades de trabajo sugeridas son: servicio DeepSeek y configuración; endpoint preguntar; errores externos; resumen e integración con notas; Swagger, pruebas y README. Los commits deben documentar trabajo efectivamente realizado. No repartir retrospectivamente cambios para aparentar una colaboración que no ocurrió.

En el repositorio real, confirmar que .env está ignorado, revisar diff, ejecutar npm test, integrar main y resolver conflictos conservando CRUD y resumen. Crear PR feature/ia → main y solicitar revisión al compañero. Publicación y revisión no fueron ejecutadas en esta entrega.

## Evidencia pendiente

API key con saldo; pruebas reales de pregunta/resumen/clave inválida; tokens de dos llamadas reales; capturas de Swagger; commits y PR de ambos; aprobación del docente del cambio de proveedor; coevaluación individual.
