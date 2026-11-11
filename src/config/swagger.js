const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lab 5: Notas + IA (DeepSeek)',
      version: '1.0.0',
      description: 'API REST con Express y Swagger integrando DeepSeek API (Guía de trabajo en parejas)',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Nota: {
          type: 'object',
          required: ['id', 'titulo', 'contenido'],
          properties: {
            id: {
              type: 'integer',
              example: 1,
              description: 'Identificador único de la nota',
            },
            titulo: {
              type: 'string',
              example: 'Recordatorio de reunión',
              description: 'Título de la nota (máx 100 caracteres)',
            },
            contenido: {
              type: 'string',
              example: 'Revisar avance del laboratorio 5 con el equipo',
              description: 'Cuerpo de la nota (máx 5000 caracteres)',
            },
          },
        },
        NotaInput: {
          type: 'object',
          required: ['titulo', 'contenido'],
          properties: {
            titulo: {
              type: 'string',
              example: 'Recordatorio de reunión',
              description: 'Título de la nota (1 a 100 caracteres)',
            },
            contenido: {
              type: 'string',
              example: 'Revisar avance del laboratorio 5 con el equipo',
              description: 'Cuerpo de la nota (1 a 5000 caracteres)',
            },
          },
        },
        Pregunta: {
          type: 'object',
          required: ['pregunta'],
          properties: {
            pregunta: {
              type: 'string',
              example: '¿Qué es una API REST y cómo funciona?',
              description: 'Pregunta libre para enviar al modelo DeepSeek',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // dónde leer los @openapi
});
