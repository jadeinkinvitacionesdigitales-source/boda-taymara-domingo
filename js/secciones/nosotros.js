// "Nosotros": foto de la pareja (o del festejado) con los nombres en letra manuscrita.
import { crear } from '../comun.js';
import { foto, parrafos } from './ayuda.js';

export default function nosotros(sec, ctx) {
  const n = ctx.config.nombres || {};
  // Solo el primer nombre de cada uno ("Taymara Villarreal Gondola" → "Taymara")
  const primero = (t) => String(t || '').trim().split(/\s+/)[0];
  const nombres = [primero(n.principal), primero(n.secundario)].filter(Boolean);
  if (!nombres.length) return null;
  return crear('section', {},
    crear('div', { clase: 'nosotros-foto' }, foto(ctx, sec.foto, nombres.join(' y '), 'Foto de los novios')),
    sec.antetitulo !== '' ? crear('p', { clase: 'nosotros-antetitulo' }, sec.antetitulo || 'Nosotros') : null,
    crear('h2', { clase: 'nosotros-nombres' },
      nombres.flatMap((t, i) => (i ? [crear('span', { clase: 'y' }, n.conector || '&'), crear('span', { clase: 'nombre' }, t)] : [crear('span', { clase: 'nombre' }, t)]))),
    parrafos(sec.texto, 'nosotros-texto'));
}
