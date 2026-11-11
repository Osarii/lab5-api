const OpenAI = require('openai');

function getClient() {
  return new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || 'missing-key',
  });
}

/**
 * Envía una solicitud a la API de DeepSeek
 * @param {string} texto - Mensaje del usuario
 * @param {string} [system] - Directiva de sistema opcional
 * @returns {Promise<{ respuesta: string, uso: object }>}
 */
async function preguntar(texto, system) {
  const client = getClient();
  const messages = [];

  if (system) {
    messages.push({ role: 'system', content: system });
  } else {
    messages.push({ role: 'system', content: 'Eres un asistente útil. Responde en español.' });
  }

  messages.push({ role: 'user', content: texto });

  const completion = await client.chat.completions.create({
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    max_tokens: 1024,
    messages,
  });

  const respuesta = completion.choices?.[0]?.message?.content ?? '';
  return {
    respuesta,
    uso: completion.usage,
  };
}

module.exports = { preguntar, getClient };
