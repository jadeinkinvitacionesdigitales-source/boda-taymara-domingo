// Hospedaje recomendado.
import { crear, enlaceSeguro } from '../comun.js';
import { parrafos, titulo } from './ayuda.js';

export default function hospedaje(sec) {
  const enlace = enlaceSeguro(sec.enlace);
  if (!sec.texto && !enlace) return null;
  return crear('section', {},
    titulo(sec, 'Hospedaje'),
    parrafos(sec.texto),
    enlace ? crear('a', { clase: 'boton', href: enlace, target: '_blank', rel: 'noopener' }, sec.texto_enlace || 'Ver opciones') : null);
}
