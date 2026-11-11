const OpenAI = require('openai');
const { AppError } = require('../utils/errors');

module.exports = (err, req, res, next) => {
  // Errores operacionales de la API (ej: 404 Nota no encontrada)
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Errores de la API de IA (DeepSeek / OpenAI)
  if (err instanceof OpenAI.APIError) {
    console.error('DeepSeek API:', err.status, err.message);
    const status = err.status === 429 ? 429
      : (err.status === 529 || err.status === 503 || err.status === 500) ? 503
      : 502;
    return res.status(status).json({ error: 'IA_NO_DISPONIBLE' });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno' });
};
