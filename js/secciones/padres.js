// Padres, padrinos u otras personas importantes.
import { crear } from '../comun.js';
import { parrafos, titulo } from './ayuda.js';

export default function padres(sec) {
  const items = Array.isArray(sec.items) ? sec.items.filter(Boolean) : [];
  if (!items.length && !sec.texto) return null;
  return crear('section', {},
    titulo(sec, 'Con la bendición de'),
    parrafos(sec.texto),
    items.length ? crear('ul', { clase: 'lista' }, items.map((t) => crear('li', {}, t))) : null);
}
