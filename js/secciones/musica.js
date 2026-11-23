// Música: solo suena después de un toque (los celulares bloquean el sonido automático).
import { crear } from '../comun.js';

export default function musica(sec, ctx) {
  const src = ctx.ruta(sec.archivo);
  if (!src) return null;
  const audio = crear('audio', { src, loop: true, preload: 'none' });
  const etiqueta = crear('span', { clase: 'musica-etiqueta' }, '▶ Dale play');
  const boton = crear('button', { clase: 'boton boton-musica', type: 'button', 'aria-label': 'Reproducir nuestra canción' },
    crear('span', { clase: 'musica-icono', 'aria-hidden': 'true' }), etiqueta);
  const flotante = crear('button', { clase: 'musica-flotante', type: 'button', 'aria-label': 'Reproducir música' }, '♪');
  // Barra que avanza mientras suena (cada plantilla decide si la muestra)
  const avance = crear('span');
  const barra = crear('div', { clase: 'musica-progreso', 'aria-hidden': 'true' }, avance);

  const pintar = () => {
    const suena = !audio.paused;
    etiqueta.textContent = suena ? '❚❚ Pausar' : '▶ Dale play';
    boton.classList.toggle('sonando', suena);
    boton.setAttribute('aria-label', suena ? 'Pausar nuestra canción' : 'Reproducir nuestra canción');
    flotante.textContent = suena ? '❚❚' : '♪';
    flotante.setAttribute('aria-label', suena ? 'Pausar música' : 'Reproducir música');
  };
  const alternar = () => (audio.paused ? audio.play().catch(() => {}) : audio.pause());
  boton.addEventListener('click', alternar);
  flotante.addEventListener('click', alternar);
  audio.addEventListener('play', pintar);
  audio.addEventListener('pause', pintar);
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) avance.style.width = (100 * audio.currentTime / audio.duration) + '%';
  });
  document.body.append(flotante);

  return crear('section', {},
    crear('p', { clase: 'musica-texto' }, sec.texto || 'Dale play a nuestra canción'),
    barra,
    boton,
    sec.titulo ? crear('p', { clase: 'musica-cancion' }, sec.titulo) : null,
    audio);
}
