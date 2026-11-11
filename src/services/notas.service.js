const { AppError } = require('../utils/errors');
const notas = new Map();
let nextId = 1;
const listar = () => [...notas.values()];
function buscar(id) {
  const nota = notas.get(id);
  if (!nota) throw new AppError(404, 'Nota no encontrada');
  return nota;
}
function crear({ titulo, contenido }) {
  const nota = { id: nextId++, titulo, contenido };
  notas.set(nota.id, nota);
  return nota;
}
function eliminar(id) { buscar(id); notas.delete(id); }
module.exports = { listar, buscar, crear, eliminar };
