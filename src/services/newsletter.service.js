const { AppError } = require('../utils/errors');

const suscriptores = new Set();

function suscribir(email) {
  const correoLimpio = String(email).trim().toLowerCase();
  const yaRegistrado = suscriptores.has(correoLimpio);

  suscriptores.add(correoLimpio);

  return {
    email: correoLimpio,
    mensaje: yaRegistrado
      ? '¡Ya estabas suscrito! Tu cupón sigue activo.'
      : '¡Bienvenido a la lista VIP de VapeKing CR!',
    cuponDescuento: 'VAPEKING10',
    descuento: '10% de descuento en tu próxima compra',
    fechaSuscripcion: new Date().toISOString(),
  };
}

function listarSuscriptores() {
  return [...suscriptores];
}

module.exports = {
  suscribir,
  listarSuscriptores,
};
