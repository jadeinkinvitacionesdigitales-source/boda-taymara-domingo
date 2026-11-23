// Portada: foto principal, nombres y fecha.
// Si la plantilla dice "portada": "tarjeta", primero va una tarjeta con nombres, frase y fecha, y debajo la foto.
import { crear, fechaPuntos, mayuscula, partesFecha } from '../comun.js';
import { foto, parrafos } from './ayuda.js';

export default function portada(sec, ctx) {
  if (ctx.plantilla.portada === 'tarjeta') return tarjeta(sec, ctx);
  const n = ctx.config.nombres || {};
  const h1 = n.secundario
    ? crear('h1', {}, n.principal, crear('span', { clase: 'y' }, n.conector || '&'), n.secundario)
    : crear('h1', {}, n.principal || ctx.evento.titulo);
  const hero = crear('div', { clase: 'hero' },
    crear('div', { clase: 'hero-foto' }, foto(ctx, sec.foto, ctx.evento.titulo, 'Foto principal')));
  // "fondo": imagen de fondo propia del evento ("" = sin fondo; si no está, usa el de la plantilla)
  if (sec.fondo !== undefined) {
    const url = ctx.ruta(sec.fondo);
    hero.style.setProperty('--fondo-portada', url && !/["()\\]/.test(url) ? `url("${url}")` : 'none');
  }
  return crear('section', {},
    hero,
    crear('div', { clase: 'nombres' },
      sec.antetitulo ? crear('p', { clase: 'antetitulo' }, sec.antetitulo) : null,
      h1,
      crear('p', { clase: 'fecha' }, sec.fecha_texto || fechaPuntos(ctx.evento.fecha_hora))));
}

function tarjeta(sec, ctx) {
  const n = ctx.config.nombres || {};
  const f = partesFecha(ctx.evento.fecha_hora);
  // "Taymara Villarreal Gondola" → "Taymara" en letra manuscrita y los apellidos debajo, pequeños
  const nombre = (texto) => {
    const [primero, ...resto] = String(texto || '').trim().split(/\s+/);
    return [crear('span', { clase: 'nombre' }, primero), resto.length ? crear('span', { clase: 'apellido' }, resto.join(' ')) : null];
  };
  const nombres = n.secundario
    ? [...nombre(n.principal), crear('span', { clase: 'y' }, n.conector || '&'), ...nombre(n.secundario)]
    : nombre(n.principal || ctx.evento.titulo);

  // Monograma sobre la foto: la imagen subida o, si no hay, las iniciales
  const monograma = ctx.ruta(ctx.config.monograma);
  const iniciales = [n.principal, n.secundario].filter(Boolean).map((t) => t.trim()[0] || '').join(' ');
  const sello = monograma
    ? crear('img', { clase: 'sello', src: monograma, alt: '' })
    : iniciales ? crear('p', { clase: 'sello sello-letras', 'aria-hidden': 'true' }, iniciales) : null;

  const heroFoto = crear('div', { clase: 'hero-foto' }, foto(ctx, sec.foto, ctx.evento.titulo, 'Foto principal'), sello);
  const boton = crear('button', { clase: 'boton boton-entrar', type: 'button' }, sec.boton || 'Toca aquí para ver la invitación');
  const tarjeta = crear('div', { clase: 'tarjeta' },
    crear('span', { clase: 'adorno adorno-izq', 'aria-hidden': 'true' }),
    crear('span', { clase: 'adorno adorno-der', 'aria-hidden': 'true' }),
    crear('span', { clase: 'adorno adorno-abajo', 'aria-hidden': 'true' }),
    sec.antetitulo ? crear('p', { clase: 'antetitulo' }, sec.antetitulo) : null,
    crear('h1', { clase: 'tarjeta-nombres' }, nombres),
    f ? crear('div', { clase: 'tarjeta-fecha' },
      crear('p', { clase: 'tarjeta-hora' }, sec.hora_texto || f.hora),
      crear('div', { clase: 'fila-fecha' },
        crear('span', { clase: 'lado' }, mayuscula(f.dia_semana)),
        crear('span', { clase: 'dia-grande' }, f.dia),
        crear('span', { clase: 'lado' }, mayuscula(f.mes))),
      crear('p', { clase: 'tarjeta-anio' }, f.anio)) : null,
    parrafos(sec.texto, 'tarjeta-texto'),
    boton,
    parrafos(sec.nota, 'tarjeta-nota'),
    sec.despedida ? crear('p', { clase: 'tarjeta-despedida' }, sec.despedida) : null);

  // Página de entrada: la tarjeta tapa la pantalla hasta que tocan el botón; luego se ve la invitación desde la foto.
  // En la vista previa del Generador (o si el enlace lleva a una sección, ej. #sec-rsvp) no tapa nada.
  const entrada = !ctx.vistaPrevia && !location.hash;
  if (entrada) {
    tarjeta.classList.add('tarjeta-entrada');
    tarjeta.setAttribute('role', 'dialog');
    tarjeta.setAttribute('aria-label', 'Portada de la invitación');
    document.body.classList.add('invitacion-cerrada');
  }
  boton.addEventListener('click', () => {
    // El toque permite que suene la música (los celulares la bloquean antes)
    const musica = document.querySelector('.musica-flotante');
    if (musica && musica.getAttribute('aria-label') === 'Reproducir música') musica.click();
    if (!entrada) { heroFoto.scrollIntoView({ behavior: 'smooth' }); return; }
    window.scrollTo(0, 0);
    document.body.classList.remove('invitacion-cerrada');
    tarjeta.classList.add('abriendo');
    const cerrar = () => { tarjeta.hidden = true; };
    tarjeta.addEventListener('transitionend', cerrar, { once: true });
    setTimeout(cerrar, 1200); // por si el celular no anima
  });

  return crear('section', {}, tarjeta, heroFoto);
}
