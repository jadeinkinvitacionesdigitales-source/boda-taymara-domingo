// Puestos reservados para el invitado del enlace personal.
import { crear } from '../comun.js';

export default function puestos(sec, ctx) {
  const inv = ctx.invitado;
  if (inv) {
    return crear('section', {},
      inv.nombre ? crear('p', { clase: 'puestos-nombre' }, inv.nombre) : null,
      crear('p', { clase: 'puestos-texto' }, sec.texto || 'Hemos reservado para ti'),
      crear('p', { clase: 'puestos-numero' }, inv.puestos),
      crear('p', { clase: 'puestos-unidad' }, inv.puestos === 1 ? 'puesto' : 'puestos'));
  }
  if (ctx.codigoInvalido) {
    return crear('section', {},
      crear('p', { clase: 'puestos-aviso' },
        'No encontramos tu invitación personal. Revisa el enlace que recibiste; mientras tanto, puedes ver la invitación.'));
  }
  return null;
}
