// Playlist colaborativa: los invitados agregan canciones (Spotify, YouTube…).
import { crear, enlaceSeguro } from '../comun.js';
import { parrafos, titulo } from './ayuda.js';

export default function playlist(sec) {
  const enlace = enlaceSeguro(sec.enlace);
  if (!enlace) return null;
  return crear('section', {},
    crear('span', { clase: 'icono icono-musica', 'aria-hidden': 'true' }),
    titulo(sec, '¡La fiesta la hacemos todos!'),
    parrafos(sec.texto || 'Agrega tus canciones favoritas a nuestra lista y dale vida a la pista.'),
    crear('a', { clase: 'boton', href: enlace, target: '_blank', rel: 'noopener' }, sec.texto_boton || 'Agregar canciones'));
}
