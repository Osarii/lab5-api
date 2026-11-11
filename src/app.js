const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const spec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(express.json());

// Servir frontend estático de VapeKing CR
app.use(express.static(path.join(__dirname, '../frontend')));

// Documentación OpenAPI / Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/api-docs.json', (req, res) => res.json(spec));

// Rutas del Laboratorio 5 (Notas e IA)
app.use('/api/notas', require('./routes/notas.routes'));
app.use('/api/ia', require('./routes/ia.routes'));

// Rutas de VapeKing CR (E-commerce)
app.use('/api/vapes', require('./routes/vapes.routes'));
app.use('/api/productos', require('./routes/vapes.routes')); // alias de conveniencia
app.use('/api/pedidos', require('./routes/pedidos.routes'));
app.use('/api/newsletter', require('./routes/newsletter.routes'));

// Manejador de rutas no encontradas
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.use(errorHandler); // siempre al final
module.exports = app;
