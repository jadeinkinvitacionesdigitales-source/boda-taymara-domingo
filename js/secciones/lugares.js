// Lugares y horas (ceremonia, recepción…) con botón "Cómo llegar".
import { crear, enlaceSeguro, fechaLarga, mayuscula } from '../comun.js';
import { foto } from './ayuda.js';

const TITULOS = { boda: 'Día de la boda', xv: 'Mis XV', cumple: 'El gran día' };

export default function lugares(sec, ctx) {
  const items = Array.isArray(sec.items) ? sec.items : [];
  if (!items.length) return null;
  const titulo = sec.titulo !== undefined ? sec.titulo : TITULOS[ctx.evento.tipo] || 'El gran día';
  // Ilustración arriba del título: la de la sección o, si no hay, el monograma del evento
  const ilustracion = ctx.ruta(sec.ilustracion !== undefined ? sec.ilustracion : ctx.config.monograma);

  return crear('section', {},
    ilustracion ? crear('img', { clase: 'mascota', src: ilustracion, alt: '' }) : null,
    crear('div', { clase: 'evento' },
      titulo ? crear('h2', { clase: 'sec-titulo' }, titulo) : null,
      crear('p', { clase: 'dia' }, mayuscula(fechaLarga(ctx.evento.fecha_hora))),
      sec.subtitulo !== '' ? crear('p', { clase: 'detalle' }, sec.subtitulo || 'Detalles') : null,
      items.map((l) => {
        const busqueda = [l.lugar, l.direccion].filter(Boolean).join(', ');
        const mapa = enlaceSeguro(l.mapa) ||
          (busqueda ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(busqueda) : '');
        // "mapa_integrado": muestra el mapa de Google dentro de la invitación
        const integrado = sec.mapa_integrado && busqueda
          ? crear('iframe', {
            clase: 'mapa', title: 'Mapa: ' + busqueda, loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade',
            src: 'https://www.google.com/maps?output=embed&q=' + encodeURIComponent(busqueda),
          })
          : null;
        return crear('div', { clase: 'momento' },
          l.foto ? foto(ctx, l.foto, l.lugar) : null,
          crear('h3', {}, l.nombre || ''),
          crear('p', {}, [l.hora, l.lugar, l.direccion].filter(Boolean).flatMap((t, i) => (i ? [crear('br'), t] : [t]))),
          mapa ? crear('a', { clase: 'boton', href: mapa, target: '_blank', rel: 'noopener' }, sec.texto_boton || 'Cómo llegar') : null,
          integrado);
      })));
}
