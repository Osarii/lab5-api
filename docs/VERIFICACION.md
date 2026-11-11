# Verificación de la adaptación

Fecha: 11/11/2026.

- `npm ci` completado y dependencias instaladas desde package-lock.
- `npm test`: 5 pruebas aprobadas, 0 fallidas.
- Flujo HTTP de Express: CRUD, validación, preguntas, resumen y errores comprobados.
- Casos límite comprobados: títulos de 100/101 caracteres, contenido de 5000/5001 caracteres y preguntas de más de 2000 caracteres.
- La llamada externa fue simulada. No hubo consumo de créditos ni verificación de una clave real.
- Swagger UI verificado con Chromium/Playwright: siete operaciones renderizadas.
- Se conservaron bloques `@openapi` encima de las rutas para cumplir el paso 11 y se mantuvo el contrato JSON publicado en `/api-docs.json`.
- `swagger-deepseek.png`: captura real de la documentación local, sin clave. No es evidencia de una respuesta real del modelo.

Pendientes para entrega académica: clave privada de DeepSeek con saldo, llamadas reales de pregunta y resumen, prueba real de clave inválida, dos registros de tokens, capturas de esas respuestas, PR/revisión y coevaluación. El PDF original permanece sin modificaciones como fuente del enunciado; usa Claude, mientras esta adaptación implementa DeepSeek por solicitud del usuario.
