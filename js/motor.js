// Motor de la invitación: lee el evento, carga su plantilla y pinta las secciones en orden.
// Funciona de tres formas:
//  1. Carpeta de un evento (la que arma el Generador): config.js trae EVENTO y los datos están en /evento.json
//  2. Vista previa del Generador (?vista=1): recibe los datos del formulario y se vuelve a pintar con cada cambio
//  3. Sitio con varios eventos: /e/<evento> y los datos vienen del script de Google
import * as api from './api.js';
import { CONFIG } from '../config.js';
import { crear, mostrarFranjaDemo } from './comun.js';

// Secciones que existen (un archivo por sección en js/secciones/). Las demás se ignoran.
const SECCIONES = ['portada', 'musica', 'frase', 'invitacion', 'cuenta_regresiva', 'lugares', 'itinerario',
  'vestimenta', 'obsequios', 'galeria', 'padres', 'aviso', 'hospedaje', 'historia', 'puestos', 'rsvp', 'cierre',
  'calendario', 'playlist', 'album', 'contacto', 'nosotros'];

// Nombre en el menú de arriba (cada sección puede cambiarlo con "menu": "…" o quitarlo con "menu": "")
const MENU = {
  portada: 'Inicio', historia: 'Nuestra historia', lugares: 'El gran día', vestimenta: 'Información',
  obsequios: 'Regalos', galeria: 'Galería', rsvp: 'Confirmar',
};

const raiz = document.getElementById('invitacion');
const estado = document.getElementById('estado');
const plantillas = {}; // plantillas ya cargadas
let cssPlantilla = null;
let variablesPuestas = [];

function leerUrl() {
  const p = new URLSearchParams(location.search);
  const m = location.pathname.match(/^\/e\/([a-z0-9-]+)/i);
  const slug = (CONFIG.EVENTO || (m ? m[1] : p.get('e')) || '').toLowerCase();
  let codigo = (p.get('i') || '').trim().toUpperCase();
  const llave = 'codigo:' + slug;
  try {
    if (codigo) localStorage.setItem(llave, codigo);
    else codigo = localStorage.getItem(llave) || '';
  } catch { /* sin almacenamiento */ }
  return { slug, codigo, llave };
}

function mostrarError(mensaje) {
  const boton = crear('button', { clase: 'boton', type: 'button' }, 'Intentar de nuevo');
  boton.addEventListener('click', () => location.reload());
  estado.replaceChildren(crear('p', { clase: 'estado-titulo' }, 'No pudimos abrir esta invitación'), crear('p', {}, mensaje), boton);
  estado.hidden = false;
  raiz.hidden = true;
}

function cargarCss(href) {
  return new Promise((listo) => {
    const link = crear('link', { rel: 'stylesheet', href });
    link.addEventListener('load', () => listo(link));
    link.addEventListener('error', () => listo(link));
    document.head.append(link);
  });
}

async function cargarPlantilla(id) {
  if (!plantillas[id]) {
    const base = `plantillas/${id}/`;
    let datos = {};
    try { datos = await (await fetch(base + 'plantilla.json')).json(); } catch { datos = {}; }
    if (datos.fuentes_url) document.head.append(crear('link', { rel: 'stylesheet', href: datos.fuentes_url }));
    plantillas[id] = { id, base, datos };
  }
  const p = plantillas[id];
  if (cssPlantilla?.dataset.plantilla !== id) {
    const nuevo = await cargarCss(p.base + 'estilos.css');
    nuevo.dataset.plantilla = id;
    cssPlantilla?.remove();
    cssPlantilla = nuevo;
    document.body.className = document.body.className.replace(/\bplantilla-\S+/g, '').trim() + ' plantilla-' + id;
  }
  return p.datos;
}

const nombreFuente = (f) => (/^[A-Za-z0-9 ]{2,40}$/.test(f || '') ? f : '');

// Colores y fuentes del evento por encima de los de la plantilla.
function aplicarEstilo(config, plantilla) {
  const css = document.documentElement.style;
  variablesPuestas.forEach((v) => css.removeProperty(v));
  variablesPuestas = [];
  const variables = plantilla.variables || {};
  for (const [clave, valor] of Object.entries(config.colores || {})) {
    if (variables[clave] && /^#[0-9a-f]{3,8}$/i.test(valor)) {
      css.setProperty(variables[clave], valor);
      variablesPuestas.push(variables[clave]);
    }
  }
  const familias = [];
  for (const [clave, valor] of Object.entries(config.fuentes || {})) {
    const f = nombreFuente(valor);
    const variable = (plantilla.variables_fuentes || {})[clave];
    if (!f || !variable) continue;
    css.setProperty(variable, `"${f}", serif`);
    variablesPuestas.push(variable);
    if (!(plantilla.fuentes_incluidas || []).includes(f)) familias.push(f);
  }
  if (familias.length) {
    const q = familias.map((f) => 'family=' + f.replace(/ /g, '+')).join('&');
    const href = `https://fonts.googleapis.com/css2?${q}&display=swap`;
    if (!document.querySelector(`link[href="${href}"]`)) document.head.append(crear('link', { rel: 'stylesheet', href }));
  }
}

// Imágenes propias del evento para decorar (fondo de página, flor de esquina, flor bajo los títulos).
// La plantilla decide dónde van: usa var(--img-…) cuando el body tiene la clase con-….
const ADORNOS = ['fondo', 'esquina', 'separador'];
function aplicarAdornos(config, ruta) {
  const css = document.documentElement.style;
  for (const nombre of ADORNOS) {
    // Dirección completa: una ruta relativa dentro de var(--img-…) se buscaría en la carpeta de la plantilla
    const relativa = ruta(config.adornos?.[nombre]);
    const url = relativa ? new URL(relativa, document.baseURI).href : '';
    const valido = url && !/["()\\]/.test(url);
    if (valido) css.setProperty('--img-' + nombre, `url("${url}")`);
    else css.removeProperty('--img-' + nombre);
    document.body.classList.toggle('con-' + nombre, !!valido);
  }
}

function crearEncabezado(secciones, ctx) {
  const items = secciones.filter((s) => s.menu);
  const monograma = ctx.ruta(ctx.config.monograma);
  const nav = crear('nav', { id: 'menu', 'aria-label': 'Secciones de la invitación' },
    crear('ul', {}, items.map((s) => crear('li', {}, crear('a', { href: '#' + s.id }, s.menu)))));
  const boton = crear('button', { clase: 'menu-boton', type: 'button', 'aria-label': 'Abrir menú', 'aria-expanded': 'false', 'aria-controls': 'menu' },
    crear('span'), crear('span'), crear('span'));
  const cambiar = (abrir) => {
    nav.classList.toggle('abierto', abrir);
    boton.classList.toggle('abierto', abrir);
    boton.setAttribute('aria-expanded', String(abrir));
    boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
  };
  boton.addEventListener('click', () => cambiar(!nav.classList.contains('abierto')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) cambiar(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cambiar(false); });
  return crear('header', { clase: 'encabezado' },
    monograma ? crear('a', { clase: 'monograma', href: '#' + (secciones[0]?.id || '') }, crear('img', { src: monograma, alt: ctx.evento.titulo })) : null,
    items.length ? boton : null,
    items.length ? nav : null);
}

const modulos = {};
async function modulo(tipo) {
  if (!(tipo in modulos)) modulos[tipo] = (await import(`./secciones/${tipo}.js`).catch(() => null))?.default || null;
  return modulos[tipo];
}

// Pinta (o vuelve a pintar) la invitación completa.
// opciones.base: carpeta de las fotos ("/" normalmente); opciones.vistaPrevia: no envía respuestas de verdad
async function pintar(evento, { slug, codigo = '', invitado = null, codigoInvalido = false, base = '', vistaPrevia = false } = {}) {
  const idPlantilla = /^[a-z0-9-]+$/.test(evento.plantilla || '') ? evento.plantilla : 'boda-clasica-giselle';
  const plantilla = await cargarPlantilla(idPlantilla);
  const config = evento.config || {};
  document.documentElement.lang = config.idioma || 'es';
  document.title = config.compartir?.titulo || evento.titulo;
  aplicarEstilo(config, plantilla);

  const ctx = {
    slug, codigo: invitado ? codigo : '', evento, config, invitado, codigoInvalido, plantilla, vistaPrevia,
    enlaceInvitacion: CONFIG.EVENTO ? location.href.split(/[?#]/)[0] : location.origin + '/e/' + slug,
    ruta: (src) => {
      const s = String(src || '').trim();
      if (!s) return '';
      if (/^https?:\/\//i.test(s)) return s;
      if (/^[a-z]+:/i.test(s) || s.includes('..')) return '';
      return s.startsWith('/') ? s : base + s;
    },
  };
  aplicarAdornos(config, ctx.ruta);

  const usados = {};
  const secciones = (Array.isArray(config.secciones) ? config.secciones : [])
    .filter((s) => s && SECCIONES.includes(s.tipo))
    .map((s) => {
      usados[s.tipo] = (usados[s.tipo] || 0) + 1;
      const id = 'sec-' + s.tipo + (usados[s.tipo] > 1 ? '-' + usados[s.tipo] : '');
      const menu = s.menu !== undefined ? s.menu : usados[s.tipo] === 1 ? MENU[s.tipo] : '';
      return { datos: s, id, menu };
    });

  document.querySelectorAll('.musica-flotante').forEach((b) => b.remove());
  const elementos = [];
  for (const s of secciones) {
    try {
      const el = (await modulo(s.datos.tipo))?.(s.datos, ctx);
      if (!el) { s.menu = ''; continue; }
      el.id = s.id;
      el.classList.add('sec', 'sec-' + s.datos.tipo);
      elementos.push(el);
    } catch (e) {
      s.menu = '';
      console.warn('No se pudo mostrar la sección', s.datos.tipo, e);
    }
  }

  const encabezado = plantilla.encabezado !== false ? crearEncabezado(secciones, ctx) : null;
  raiz.replaceChildren(...[encabezado, ...elementos].filter(Boolean));
  estado.hidden = true;
  raiz.hidden = false;
  if (plantilla.animaciones && !vistaPrevia) animarAlBajar(elementos);
}

// Las secciones aparecen suavemente al bajar (solo si la plantilla lo pide con "animaciones": true)
function animarAlBajar(elementos) {
  if (!('IntersectionObserver' in window)) return;
  const observador = new IntersectionObserver((entradas) => entradas.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    observador.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  elementos.forEach((el) => {
    // Lo que ya se ve al abrir la invitación no espera la animación
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add('aparece');
    observador.observe(el);
  });
}

// La fecha límite vale hasta las 11:59 pm de ese día, hora de Panamá.
const rsvpCerrado = (ev) => !!ev.rsvp_limite && Date.now() > new Date(ev.rsvp_limite + 'T23:59:59-05:00').getTime();

// ---------- Vista previa del Generador ----------
function modoVistaPrevia() {
  let pendiente = null;
  let pintando = false;
  window.addEventListener('message', async (e) => {
    if (e.origin !== location.origin || e.data?.tipo !== 'vista') return;
    pendiente = e.data;
    if (pintando) return;
    pintando = true;
    while (pendiente) {
      const { evento, invitado, base } = pendiente;
      pendiente = null;
      const y = window.scrollY;
      evento.rsvp_cerrado = rsvpCerrado(evento);
      await pintar(evento, { slug: evento.slug, codigo: invitado ? 'VISTA1' : '', invitado, base, vistaPrevia: true });
      window.scrollTo(0, y);
    }
    window.parent.postMessage({ tipo: 'vista-pintada' }, location.origin);
    pintando = false;
  });
  window.parent.postMessage({ tipo: 'vista-lista' }, location.origin);
}

// ---------- Invitación real ----------
async function iniciar() {
  if (new URLSearchParams(location.search).get('vista') === '1') return modoVistaPrevia();
  mostrarFranjaDemo();
  const { slug, codigo, llave } = leerUrl();
  if (!slug) return mostrarError('Falta el nombre del evento en el enlace.');

  let evento;
  try {
    if (CONFIG.EVENTO) {
      const r = await fetch('evento.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error('No encontramos los datos de la invitación.');
      evento = await r.json();
      evento.rsvp_cerrado = rsvpCerrado(evento);
    } else {
      evento = await api.evento(slug);
    }
  } catch (e) {
    return mostrarError(e.message);
  }

  let invitado = null;
  let codigoInvalido = false;
  if (codigo) {
    try {
      invitado = await api.invitado(slug, codigo);
    } catch {
      codigoInvalido = true;
      try { localStorage.removeItem(llave); } catch { /* nada */ }
    }
  }

  await pintar(evento, { slug, codigo, invitado, codigoInvalido });
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

iniciar();
