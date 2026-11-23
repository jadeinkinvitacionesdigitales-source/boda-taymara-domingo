// Obsequios: lluvia de sobres, cuenta bancaria (con botón copiar), Yappy, mesa de regalos.
import { avisar, copiarTexto, crear, enlaceSeguro } from '../comun.js';
import { parrafos, titulo } from './ayuda.js';

export default function obsequios(sec) {
  const b = sec.banco && sec.banco.numero ? sec.banco : null;
  const yappy = typeof sec.yappy === 'string' ? { numero: sec.yappy } : sec.yappy || null;
  const mesa = enlaceSeguro(sec.enlace);
  if (!sec.texto && !b && !yappy && !mesa) return null;

  let cuenta = null;
  if (b) {
    const copiar = crear('button', { clase: 'copiar', type: 'button' }, 'Copiar número');
    copiar.addEventListener('click', async () => {
      avisar((await copiarTexto(String(b.numero).replace(/\s/g, ''))) ? 'Número copiado' : 'No se pudo copiar');
    });
    cuenta = crear('div', { clase: 'cuenta' },
      crear('span', { clase: 'icono icono-regalo', 'aria-hidden': 'true' }),
      b.titular ? crear('p', {}, b.titular) : null,
      b.identificacion ? crear('p', {}, b.identificacion) : null,
      b.banco ? crear('p', {}, b.banco) : null,
      b.tipo ? crear('p', {}, 'Cuenta de ' + String(b.tipo).toLowerCase()) : null,
      crear('p', { clase: 'numero' }, b.numero),
      b.correo ? crear('p', {}, b.correo) : null,
      copiar);
  }

  return crear('section', {},
    crear('span', { clase: 'icono icono-regalo', 'aria-hidden': 'true' }),
    titulo(sec, 'Mesa de regalos'),
    parrafos(sec.texto),
    // Código de novios de una tienda (ej. "Código de novios: 19238415")
    sec.codigo ? crear('p', { clase: 'codigo-novios' }, sec.codigo) : null,
    yappy && (yappy.numero || yappy.enlace)
      ? crear('div', { clase: 'yappy' },
        crear('p', {}, 'Yappy' + (yappy.numero ? ': ' + yappy.numero : '')),
        enlaceSeguro(yappy.enlace) ? crear('a', { clase: 'boton', href: enlaceSeguro(yappy.enlace), target: '_blank', rel: 'noopener' }, 'Abrir Yappy') : null)
      : null,
    mesa ? crear('a', { clase: 'boton', href: mesa, target: '_blank', rel: 'noopener' }, sec.texto_enlace || 'Ver mesa de regalos') : null,
    cuenta);
}
