// Contacto: botón de WhatsApp para dudas (usa el WhatsApp de los anfitriones si no hay otro).
import { crear, enlaceWhatsApp } from '../comun.js';
import { parrafos, titulo } from './ayuda.js';

export default function contacto(sec, ctx) {
  const telefono = String(sec.telefono || ctx.config.contacto_whatsapp || '').replace(/[^\d+]/g, '');
  if (!telefono) return null;
  return crear('section', {},
    titulo(sec, ''),
    parrafos(sec.texto || 'Si tienes alguna consulta, escríbenos.'),
    crear('a', {
      clase: 'boton', href: enlaceWhatsApp(telefono, `Hola, escribo por la invitación de ${ctx.evento.titulo}.`), target: '_blank', rel: 'noopener',
    }, sec.texto_boton || 'Escribir por WhatsApp'));
}
