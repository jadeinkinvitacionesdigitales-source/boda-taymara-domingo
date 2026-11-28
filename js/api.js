// Envío de respuestas: a la hoja de Google (CONFIG.API_URL, el Apps Script del panel) o,
// si todavía no está conectada, por WhatsApp a los novios.
import { CONFIG } from '../config.js';

export const modoDemo = false;

const URL_SCRIPT = String(CONFIG.API_URL || '').trim();

export async function evento() {
  throw new Error('Los datos de esta invitación vienen de evento.json.');
}

export async function invitado() {
  throw new Error('Esta invitación usa enlaces con nombre y puestos (?n=&p=).');
}

function whatsapp(telefono, texto) {
  const numero = String(telefono || '').replace(/\D/g, '');
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank');
}

async function enviar(datos) {
  const r = await fetch(URL_SCRIPT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(datos),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error('No pudimos guardar tu respuesta. Intenta de nuevo en un momento.');
}

// d: { nombre, invitado, puestos, asiste (bool), personas, mensaje, whatsapp, titulo }
export async function confirmar(d) {
  const r = { nombre: d.nombre, puestos: d.puestos, estado: d.asiste ? 'confirmado' : 'no_asiste', asistentes: d.asiste ? d.personas : 0, mensaje: d.mensaje };
  if (!URL_SCRIPT) {
    // Sin hoja conectada: se abre WhatsApp (antes de cualquier espera, para que el navegador no lo bloquee)
    whatsapp(d.whatsapp, d.asiste
      ? `¡Hola! Soy ${d.nombre}. Confirmo mi asistencia a la boda de ${d.titulo} 💍 Asistiremos ${d.personas} ${d.personas === 1 ? 'persona' : 'personas'}.${d.mensaje ? '\n' + d.mensaje : ''}`
      : `¡Hola! Soy ${d.nombre}. Lamentablemente no podré asistir a la boda de ${d.titulo}. ¡Les deseo un día precioso! 🤍${d.mensaje ? '\n' + d.mensaje : ''}`);
    return r;
  }
  await enviar({ action: 'rsvp', nombre: d.nombre, asiste: d.asiste ? 'si' : 'no', personas: r.asistentes, puestos: d.puestos || '', mensaje: d.mensaje, invitado: d.invitado || '' });
  return r;
}

// d: { cancion, artista, nombre, whatsapp, titulo }
export async function sugerirCancion(d) {
  if (!URL_SCRIPT) {
    whatsapp(d.whatsapp, `🎶 Sugerencia para la boda de ${d.titulo}: ${d.cancion}${d.artista ? ' – ' + d.artista : ''}${d.nombre ? ' (de ' + d.nombre + ')' : ''}`);
    return;
  }
  await enviar({ action: 'cancion', cancion: d.cancion, artista: d.artista, nombre: d.nombre });
}
