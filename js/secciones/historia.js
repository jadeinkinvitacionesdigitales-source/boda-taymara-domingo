// Nuestra historia: capítulos con texto y foto, alternados.
import { crear } from '../comun.js';
import { foto, parrafos, titulo } from './ayuda.js';

export default function historia(sec, ctx) {
  const items = Array.isArray(sec.items) ? sec.items.filter(Boolean) : [];
  if (!items.length) return null;
  return crear('section', {},
    titulo(sec, 'Nuestra historia'),
    items.map((c, i) => {
      const texto = crear('div', { clase: 'bloque' },
        c.cuando ? crear('p', { clase: 'cuando' }, c.cuando) : null,
        c.titulo ? crear('h3', {}, c.titulo) : null,
        parrafos(c.texto));
      const imagen = c.foto !== undefined ? foto(ctx, c.foto, c.titulo) : null;
      return crear('div', { clase: 'historia' }, ...(i % 2 ? [imagen, texto] : [texto, imagen]));
    }));
}
