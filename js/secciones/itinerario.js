// Itinerario: hora + actividad.
import { crear } from '../comun.js';
import { titulo } from './ayuda.js';

export default function itinerario(sec) {
  const items = Array.isArray(sec.items) ? sec.items.filter((i) => i && (i.hora || i.texto)) : [];
  if (!items.length) return null;
  return crear('section', {},
    titulo(sec, 'Itinerario'),
    crear('ol', { clase: 'itinerario-lista' },
      items.map((i) => crear('li', {}, crear('span', { clase: 'hora' }, i.hora || ''), crear('span', { clase: 'actividad' }, i.texto || '')))));
}
