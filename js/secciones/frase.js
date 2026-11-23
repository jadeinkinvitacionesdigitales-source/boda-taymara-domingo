// Frase o versículo.
import { crear } from '../comun.js';

export default function frase(sec) {
  if (!sec.texto) return null;
  return crear('section', {},
    crear('blockquote', {},
      crear('p', {}, sec.texto),
      sec.cita ? crear('cite', {}, sec.cita) : null));
}
