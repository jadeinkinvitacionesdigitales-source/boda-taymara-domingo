// Piezas que comparten varias secciones.
import { crear, enlaceSeguro } from '../comun.js';

// Foto del evento, o un recuadro gris con texto si todavía no hay foto.
export function foto(ctx, src, alt, textoVacio = 'Foto') {
  const url = ctx.ruta(src);
  if (!url) return crear('div', { clase: 'foto-vacia', role: 'img', 'aria-label': textoVacio }, textoVacio);
  return crear('img', { src: url, alt: alt || '', loading: 'lazy', decoding: 'async' });
}

export function titulo(sec, porDefecto) {
  const t = sec.titulo !== undefined ? sec.titulo : porDefecto;
  return t ? crear('h2', { clase: 'sec-titulo' }, t) : null;
}

// Párrafos a partir de un texto con saltos de línea.
export function parrafos(texto, clase) {
  return String(texto || '').split(/\n+/).filter((t) => t.trim()).map((t) => crear('p', { clase }, t.trim()));
}

// Monograma del evento: la imagen subida o, si no hay, las iniciales ("T D")
export function monograma(ctx, clase = 'monograma-sec') {
  const n = ctx.config.nombres || {};
  const src = ctx.ruta(ctx.config.monograma);
  if (src) return crear('img', { clase, src, alt: '' });
  const iniciales = Array.isArray(ctx.config.monograma_iniciales) ? ctx.config.monograma_iniciales : [n.principal, n.secundario].filter(Boolean).map((t) => t.trim()[0] || '');
  if (!iniciales.length) return null;
  return crear('p', { clase: clase + ' monograma-letras', 'aria-hidden': 'true' },
    iniciales.flatMap((l, i) => (i ? [crear('span', { clase: 'monograma-y' }, '&'), l] : [l])));
}

// Botones "Google Calendar" y "iPhone / Outlook" con la fecha y el lugar del evento.
export function botonesCalendario(ctx) {
  const ev = ctx.evento;
  const inicio = new Date(ev.fecha_hora);
  if (isNaN(inicio)) return null;
  // Hora de salida del evento o, si no la hay, 5 horas después del inicio
  const finEvento = new Date(ev.fecha_fin);
  const fin = finEvento > inicio ? finEvento : new Date(inicio.getTime() + 5 * 3600e3);
  const utc = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lugar = ((ctx.config.secciones || []).find((s) => s.tipo === 'lugares')?.items || [])[0] || {};
  const donde = [lugar.lugar, lugar.direccion].filter(Boolean).join(', ');
  const enlace = ctx.enlaceInvitacion;

  const google = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(ev.titulo) + '&dates=' + utc(inicio) + '/' + utc(fin) +
    '&location=' + encodeURIComponent(donde) + '&details=' + encodeURIComponent(enlace);

  const escapar = (t) => String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Jade Ink Studio//ES', 'BEGIN:VEVENT',
    'UID:' + ctx.slug + '@jadeink', 'DTSTAMP:' + utc(new Date()), 'DTSTART:' + utc(inicio), 'DTEND:' + utc(fin),
    'SUMMARY:' + escapar(ev.titulo), 'LOCATION:' + escapar(donde), 'DESCRIPTION:' + escapar(enlace),
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const archivo = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));

  return crear('div', { clase: 'rsvp-acciones' },
    crear('a', { clase: 'boton boton-secundario', href: enlaceSeguro(google), target: '_blank', rel: 'noopener' }, 'Google Calendar'),
    crear('a', { clase: 'boton boton-secundario', href: archivo, download: ctx.slug + '.ics' }, 'iPhone / Outlook'));
}
