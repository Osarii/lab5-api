const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lab 5: Notas + IA',
      version: '1.0.0',
      description: 'API REST con Express y Swagger integrando la Claude API (Guía de trabajo en parejas)',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Pregunta: {
          type: 'object',
          required: ['pregunta'],
          properties: {
            pregunta: {
              type: 'string',
              example: '¿Qué es una API REST y cómo funciona?',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // dónde leer los @openapi
});
