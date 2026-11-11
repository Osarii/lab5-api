const { AppError } = require('../utils/errors');

class DeepSeekError extends Error {
  constructor(status) { super('DeepSeek no disponible'); this.status = status; }
}

async function preguntar(texto, system = 'Eres un asistente útil. Responde en español.') {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) throw new AppError(503, 'IA_NO_CONFIGURADA');
  let response;
  let data;
  try {
    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-flash',
        messages: [{ role: 'system', content: system }, { role: 'user', content: texto }],
        thinking: { type: 'disabled' },
        max_tokens: 1024,
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new DeepSeekError(response.status);
    data = await response.json();
  } catch (err) {
    if (err instanceof DeepSeekError) throw err;
    throw new DeepSeekError(err.name === 'TimeoutError' ? 503 : 502);
  }
  const respuesta = data.choices?.[0]?.message?.content;
  if (typeof respuesta !== 'string' || !respuesta.trim() || data.choices[0].finish_reason === 'length') {
    throw new DeepSeekError(502);
  }
  return { respuesta, uso: data.usage ?? {} };
}
module.exports = { preguntar, DeepSeekError };
