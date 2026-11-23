// Mensaje de invitación.
import { crear } from '../comun.js';
import { parrafos, titulo } from './ayuda.js';

export default function invitacion(sec) {
  if (!sec.texto) return null;
  return crear('section', {}, titulo(sec, ''), parrafos(sec.texto, 'texto-invitacion'));
}
