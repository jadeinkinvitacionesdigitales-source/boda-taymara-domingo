// Código de vestimenta, colores reservados e ilustración opcional.
// "colores_reservados" acepta textos ("Blanco") o círculos de color ({ "nombre": "Champaña", "hex": "#cbb697" }).
import { crear } from '../comun.js';
import { parrafos, titulo } from './ayuda.js';

const esHex = (h) => /^#[0-9a-f]{3,8}$/i.test(String(h || ''));

export default function vestimenta(sec, ctx) {
  const colores = Array.isArray(sec.colores_reservados) ? sec.colores_reservados.filter(Boolean) : [];
  if (!sec.codigo && !colores.length && !sec.nota) return null;
  const ilustracion = ctx.ruta(sec.ilustracion);
  const muestras = colores.filter((c) => typeof c === 'object' && esHex(c.hex));
  const textos = colores.filter((c) => typeof c === 'string');
  return crear('section', {},
    ilustracion ? crear('img', { clase: 'vestimenta-ilustracion', src: ilustracion, alt: '', loading: 'lazy' }) : null,
    titulo(sec, 'Código de vestimenta'),
    sec.codigo ? crear('p', { clase: 'vestimenta-codigo' }, sec.codigo) : null,
    muestras.length ? crear('div', { clase: 'paleta' },
      sec.paleta_titulo ? crear('p', { clase: 'paleta-titulo' }, sec.paleta_titulo) : null,
      crear('ul', { clase: 'paleta-colores' }, muestras.map((c) => crear('li', {},
        crear('span', { clase: 'paleta-circulo', style: 'background:' + c.hex, 'aria-hidden': 'true' }),
        crear('span', { clase: 'paleta-nombre' }, c.nombre || ''))))) : null,
    textos.length ? crear('p', {}, 'Colores reservados: ' + textos.join(', ')) : null,
    parrafos(sec.nota));
}
