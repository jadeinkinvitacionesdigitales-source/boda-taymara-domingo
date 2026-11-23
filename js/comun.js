// Ayudas que usan todas las páginas.
import { modoDemo } from './api.js';

export const ZONA = 'America/Panama';

// Crea un elemento con texto seguro (nunca usa innerHTML).
export function crear(etiqueta, atributos = {}, ...hijos) {
  const el = document.createElement(etiqueta);
  for (const [k, v] of Object.entries(atributos)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'clase') el.className = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const h of hijos.flat()) {
    if (h === null || h === undefined || h === false) continue;
    el.append(h instanceof Node ? h : document.createTextNode(String(h)));
  }
  return el;
}

// Muestra la franja amarilla arriba cuando no hay URL de Google en config.js.
export function mostrarFranjaDemo() {
  if (!modoDemo || document.querySelector('.franja-demo')) return;
  const franja = crear('div', { clase: 'franja-demo', role: 'status' },
    crear('strong', {}, 'Modo demostración'),
    ' · Los datos son de ejemplo y se guardan solo en este navegador.');
  document.body.prepend(franja);
}

// Solo deja pasar enlaces http(s), mailto y tel (nunca "javascript:").
export function enlaceSeguro(url) {
  const u = String(url || '').trim();
  return /^(https?:|mailto:|tel:)/i.test(u) ? u : '';
}

// Ruta de una foto o canción: "media/x.webp" → "/media/x.webp"; enlaces https se dejan igual.
export function ruta(src, base = '/') {
  const s = String(src || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[a-z]+:/i.test(s) || s.includes('..')) return '';
  return s.startsWith('/') ? s : base + s;
}

// ---------- Fechas (siempre hora de Panamá) ----------
export function fechaLarga(iso, conDiaSemana = true) {
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00-05:00' : iso);
  if (isNaN(d)) return '';
  return new Intl.DateTimeFormat('es-PA', {
    timeZone: ZONA, weekday: conDiaSemana ? 'long' : undefined, day: 'numeric', month: 'long', year: 'numeric',
  }).format(d);
}

export function fechaPuntos(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const p = new Intl.DateTimeFormat('es-PA', { timeZone: ZONA, day: '2-digit', month: '2-digit', year: 'numeric' })
    .formatToParts(d).reduce((o, x) => ({ ...o, [x.type]: x.value }), {});
  return `${p.day}.${p.month}.${p.year}`;
}

// Partes sueltas de la fecha: { dia_semana: 'sábado', dia: '25', mes: 'octubre', anio: '2025', hora: '6:00 p. m.' }
export function partesFecha(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return null;
  const p = new Intl.DateTimeFormat('es-PA', {
    timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
  }).formatToParts(d).reduce((o, x) => ({ ...o, [x.type]: x.value }), {});
  return { dia_semana: p.weekday, dia: p.day, mes: p.month, anio: p.year, hora: `${p.hour}:${p.minute} ${p.dayPeriod || ''}`.trim() };
}

export function fechaCorta(iso) {
  const d = new Date(iso);
  if (!iso || isNaN(d)) return '';
  return new Intl.DateTimeFormat('es-PA', {
    timeZone: ZONA, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(d);
}

export const mayuscula = (t) => t ? t[0].toUpperCase() + t.slice(1) : t;

// ---------- Copiar y WhatsApp ----------
export async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Respaldo para navegadores sin acceso al portapapeles
    const area = crear('textarea', { readonly: true, style: 'position:fixed;opacity:0' });
    area.value = texto;
    document.body.append(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    area.remove();
    return ok;
  }
}

export function enlaceWhatsApp(telefono, mensaje) {
  const numero = String(telefono || '').replace(/\D/g, '');
  const texto = encodeURIComponent(mensaje || '');
  return numero ? `https://wa.me/${numero}?text=${texto}` : `https://wa.me/?text=${texto}`;
}

// Aviso breve abajo de la pantalla ("Enlace copiado").
export function avisar(texto) {
  let caja = document.getElementById('aviso-flotante');
  if (!caja) {
    caja = crear('div', { id: 'aviso-flotante', clase: 'aviso-flotante', role: 'status', 'aria-live': 'polite' });
    document.body.append(caja);
  }
  caja.textContent = texto;
  caja.classList.add('visible');
  clearTimeout(avisar.reloj);
  avisar.reloj = setTimeout(() => caja.classList.remove('visible'), 2600);
}
