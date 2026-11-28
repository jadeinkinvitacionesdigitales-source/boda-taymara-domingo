// Playlist: con "enlace" lleva a una lista colaborativa (Spotify, YouTube…);
// sin enlace, los invitados sugieren canciones que llegan al panel (o por WhatsApp).
import * as api from '../api.js';
import { avisar, crear, enlaceSeguro } from '../comun.js';
import { parrafos, titulo } from './ayuda.js';

export default function playlist(sec, ctx) {
  const enlace = enlaceSeguro(sec.enlace);
  if (enlace) {
    return crear('section', {},
      crear('span', { clase: 'icono icono-musica', 'aria-hidden': 'true' }),
      titulo(sec, '¡La fiesta la hacemos todos!'),
      parrafos(sec.texto || 'Agrega tus canciones favoritas a nuestra lista y dale vida a la pista.'),
      crear('a', { clase: 'boton', href: enlace, target: '_blank', rel: 'noopener' }, sec.texto_boton || 'Agregar canciones'));
  }
  const cancion = crear('input', { id: 'pl-cancion', type: 'text', maxlength: '150', required: true, autocomplete: 'off' });
  const artista = crear('input', { id: 'pl-artista', type: 'text', maxlength: '120', autocomplete: 'off' });
  const error = crear('p', { clase: 'rsvp-error', role: 'alert' });
  const boton = crear('button', { clase: 'boton', type: 'submit' }, sec.texto_boton || 'Sugerir canción');
  const form = crear('form', { clase: 'formulario', novalidate: true },
    crear('div', {}, crear('label', { for: 'pl-cancion' }, 'Canción'), cancion),
    crear('div', {}, crear('label', { for: 'pl-artista' }, 'Artista (opcional)'), artista),
    error,
    crear('div', { clase: 'rsvp-acciones' }, boton));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.textContent = '';
    const c = cancion.value.trim();
    if (!c) { error.textContent = 'Escribe el nombre de la canción.'; cancion.focus(); return; }
    if (ctx.vistaPrevia) { avisar('¡Gracias por tu canción!'); form.reset(); return; }
    boton.disabled = true;
    try {
      await api.sugerirCancion({ cancion: c, artista: artista.value.trim(), nombre: ctx.invitado?.nombre || '', whatsapp: ctx.config.contacto_whatsapp, titulo: ctx.evento.titulo });
      form.reset();
      avisar('¡Gracias por tu canción! 🎶');
    } catch (err) {
      error.textContent = err.message;
    }
    boton.disabled = false;
  });
  return crear('section', {},
    crear('span', { clase: 'icono icono-musica', 'aria-hidden': 'true' }),
    titulo(sec, '¡La fiesta la hacemos todos!'),
    parrafos(sec.texto || '¿Qué canción no puede faltar para que bailes toda la noche? Sugiérela aquí.'),
    crear('div', { clase: 'pl-caja' }, form));
}
