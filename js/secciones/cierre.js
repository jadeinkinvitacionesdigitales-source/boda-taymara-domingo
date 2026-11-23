// Cierre / agradecimiento al final de la invitación (con título y foto opcionales).
import { crear } from '../comun.js';
import { foto, parrafos, titulo } from './ayuda.js';

export default function cierre(sec, ctx) {
  if (!sec.texto && !sec.titulo && !sec.foto) return null;
  return crear('footer', {},
    titulo(sec, ''),
    sec.foto ? crear('div', { clase: 'cierre-foto' }, foto(ctx, sec.foto, '')) : null,
    parrafos(sec.texto));
}
