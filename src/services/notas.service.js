const { AppError } = require('../utils/errors');

let notas = [];
let nextId = 1;

const listar = () => notas;

function buscar(id) {
  const n = notas.find((n) => n.id === id);
  if (!n) throw new AppError(404, 'Nota no encontrada');
  return n;
}

function crear({ titulo, contenido }) {
  const n = { id: nextId++, titulo, contenido };
  notas.push(n);
  return n;
}

function eliminar(id) {
  buscar(id); // Lanza AppError 404 si la nota no existe
  notas = notas.filter((n) => n.id !== id);
}

module.exports = { listar, buscar, crear, eliminar };
