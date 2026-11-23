// Aviso (sin niños, sorpresa, etc.).
import { crear } from '../comun.js';
import { parrafos, titulo } from './ayuda.js';

export default function aviso(sec) {
  if (!sec.texto && !sec.titulo) return null;
  return crear('section', {}, titulo(sec, ''), parrafos(sec.texto));
}
