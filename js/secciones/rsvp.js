// Confirmación de asistencia (RSVP).
import * as api from '../api.js';
import { crear, enlaceWhatsApp, fechaLarga } from '../comun.js';
import { botonesCalendario, titulo } from './ayuda.js';

let contador = 0;

export default function rsvp(sec, ctx) {
  const ev = ctx.evento;
  const n = ctx.config.nombres || {};
  const anfitriones = [n.principal, n.secundario].filter(Boolean).join(' y ') || ev.titulo;
  const caja = crear('div', { clase: 'rsvp-caja', tabindex: '-1' });
  const limite = ev.rsvp_limite && !ev.rsvp_cerrado
    ? crear('p', { clase: 'aviso-rsvp' }, (sec.texto || 'Por favor confirma antes del') + ' ' + fechaLarga(ev.rsvp_limite, false))
    : null;

  let inv = ctx.invitado;
  let editando = false;
  let recienEnviado = false;
  let general = null; // respuesta enviada sin enlace personal

  function pintar() {
    if (ev.rsvp_cerrado) return caja.replaceChildren(...cerrado());
    if (general) return caja.replaceChildren(crear('p', { clase: 'gracias-rsvp' }, '¡Gracias! Recibimos tu respuesta.'), ...resumen(general));
    if (inv && inv.estado !== 'pendiente' && !editando) {
      const cambiar = crear('button', { clase: 'boton', type: 'button' }, 'Cambiar respuesta');
      cambiar.addEventListener('click', () => { editando = true; recienEnviado = false; pintar(); caja.focus(); });
      return caja.replaceChildren(
        recienEnviado ? crear('p', { clase: 'gracias-rsvp' }, '¡Gracias! Recibimos tu respuesta.') : null,
        ...resumen(inv),
        inv.estado === 'confirmado' ? calendario() : null,
        crear('div', { clase: 'rsvp-acciones' }, cambiar));
    }
    if (inv) return caja.replaceChildren(formulario(false));
    if (ev.rsvp_sin_codigo) return caja.replaceChildren(formulario(true));
    caja.replaceChildren(crear('p', { clase: 'aviso-rsvp' }, ctx.codigoInvalido
      ? 'No encontramos tu invitación personal. Para confirmar, abre el enlace que recibiste por WhatsApp.'
      : 'Para confirmar tu asistencia, usa el enlace personal que recibiste por WhatsApp.'));
  }

  function resumen(r) {
    return [
      crear('p', { clase: 'rsvp-resumen' }, r.estado === 'confirmado'
        ? `Confirmaste tu asistencia: ${r.asistentes} ${r.asistentes === 1 ? 'persona' : 'personas'}.`
        : 'Nos dijiste que no podrás asistir. ¡Te extrañaremos!'),
      r.mensaje ? crear('p', { clase: 'rsvp-mensaje' }, `Tu mensaje: “${r.mensaje}”`) : null,
    ];
  }

  function cerrado() {
    const contacto = String(ctx.config.contacto_whatsapp || '').replace(/[^\d+]/g, '');
    return [
      inv && inv.estado !== 'pendiente' ? resumen(inv) : [],
      crear('p', { clase: 'aviso-rsvp' },
        `La confirmación cerró el ${fechaLarga(ev.rsvp_limite, false)}. Si necesitas hacer un cambio, escribe a los anfitriones.`),
      contacto ? crear('a', { clase: 'boton', href: enlaceWhatsApp(contacto, `Hola, escribo por la invitación de ${ev.titulo}.`), target: '_blank', rel: 'noopener' }, 'Escribir por WhatsApp') : null,
    ].flat();
  }

  function formulario(sinCodigo) {
    const id = 'rsvp' + (++contador);
    const maximo = sinCodigo ? 10 : inv.puestos;
    const error = crear('p', { clase: 'rsvp-error', role: 'alert' });
    const enviar = crear('button', { clase: 'boton', type: 'submit' }, 'Enviar');

    const opcion = (valor, texto) => crear('label', {},
      crear('input', { type: 'radio', name: 'asiste', value: valor, required: true,
        checked: editando && inv && ((valor === 'si') === (inv.estado === 'confirmado')) }),
      crear('span', {}, texto));

    const personas = crear('select', { id: id + '-personas', name: 'personas' },
      Array.from({ length: maximo }, (_, i) => crear('option', { value: i + 1 }, i + 1)));
    personas.value = String(inv && inv.asistentes ? inv.asistentes : sinCodigo ? 1 : maximo);
    const campoPersonas = crear('div', { clase: 'campo-personas' },
      crear('label', { for: id + '-personas' }, 'Número de personas'), personas);

    const mensaje = crear('textarea', { id: id + '-mensaje', name: 'mensaje', maxlength: '500' });
    mensaje.value = inv && editando ? inv.mensaje || '' : '';
    const nombre = sinCodigo ? crear('input', { id: id + '-nombre', name: 'nombre', type: 'text', required: true, maxlength: '120', autocomplete: 'name' }) : null;

    const form = crear('form', { clase: 'formulario', novalidate: true },
      sinCodigo ? crear('div', {}, crear('label', { for: id + '-nombre' }, 'Tu nombre'), nombre) : null,
      crear('fieldset', {},
        crear('legend', {}, '¿Asistirás?'),
        crear('div', { clase: 'opciones' }, opcion('si', sec.texto_si || 'Sí, ahí estaré'), opcion('no', sec.texto_no || 'No podré ir'))),
      maximo > 1 ? campoPersonas : null,
      crear('div', {}, crear('label', { for: id + '-mensaje' }, `Mensaje para ${anfitriones} (opcional)`), mensaje),
      error,
      crear('div', { clase: 'rsvp-acciones' }, enviar));

    const mostrarPersonas = () => {
      campoPersonas.hidden = form.elements.asiste.value === 'no';
    };
    form.addEventListener('change', mostrarPersonas);
    mostrarPersonas();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      error.textContent = '';
      const asiste = form.elements.asiste.value;
      if (sinCodigo && !nombre.value.trim()) { error.textContent = 'Escribe tu nombre.'; nombre.focus(); return; }
      if (!asiste) { error.textContent = 'Elige si asistirás o no.'; return; }
      const cuantos = asiste === 'si' ? (maximo > 1 ? Number(personas.value) : 1) : 0;
      enviar.disabled = true;
      enviar.textContent = 'Enviando…';
      try {
        if (ctx.vistaPrevia) {
          // En la vista previa del Generador no se guarda nada
          const r = { nombre: sinCodigo ? nombre.value.trim() : inv.nombre, puestos: maximo, estado: asiste === 'si' ? 'confirmado' : 'no_asiste', asistentes: cuantos, mensaje: mensaje.value.trim() };
          if (sinCodigo) general = r; else inv = r;
        } else if (sinCodigo) {
          general = await api.responderGeneral(ctx.slug, nombre.value.trim(), asiste === 'si', cuantos, mensaje.value.trim());
        } else {
          inv = await api.responder(ctx.slug, ctx.codigo, asiste === 'si', cuantos, mensaje.value.trim());
        }
        editando = false;
        recienEnviado = true;
        pintar();
        caja.focus();
      } catch (err) {
        error.textContent = err.message;
        enviar.disabled = false;
        enviar.textContent = 'Enviar';
      }
    });
    return form;
  }

  function calendario() {
    const botones = botonesCalendario(ctx);
    if (!botones) return null;
    return crear('div', { clase: 'calendario' }, crear('p', { clase: 'calendario-titulo' }, 'Agregar al calendario'), botones);
  }

  pintar();
  return crear('section', {}, titulo(sec, 'Confirma tu asistencia'), limite, caja);
}
