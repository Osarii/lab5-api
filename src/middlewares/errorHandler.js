const { AppError } = require('../utils/errors');
const { DeepSeekError } = require('../services/deepseek.service');
module.exports = (err, req, res, next) => {
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message });
  if (err instanceof DeepSeekError) {
    console.error('DeepSeek API:', err.status);
    const status = err.status === 429 ? 429 : [503, 529].includes(err.status) ? 503 : 502;
    return res.status(status).json({ error: 'IA_NO_DISPONIBLE' });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Solicitud demasiado grande' });
  console.error('Error interno del servidor');
  res.status(500).json({ error: 'Error interno' });
};
