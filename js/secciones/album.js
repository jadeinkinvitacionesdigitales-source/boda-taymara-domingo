// Álbum compartido: botón para subir fotos y código QR para escanear el día del evento.
import { crear, enlaceSeguro } from '../comun.js';
import { parrafos, titulo } from './ayuda.js';

// Librería para dibujar el QR (versión fija, se carga solo si hace falta)
const LIBRERIA_QR = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
let cargandoQr = null;
function cargarQr() {
  if (!cargandoQr) {
    cargandoQr = new Promise((listo, falla) => {
      const s = crear('script', { src: LIBRERIA_QR, crossorigin: 'anonymous', referrerpolicy: 'no-referrer' });
      s.addEventListener('load', () => listo(window.QRCode));
      s.addEventListener('error', () => { cargandoQr = null; falla(); });
      document.head.append(s);
    });
  }
  return cargandoQr;
}

export default function album(sec) {
  const enlace = enlaceSeguro(sec.enlace);
  if (!enlace) return null;
  const qr = sec.qr === false ? null : crear('div', { clase: 'qr', role: 'img', 'aria-label': 'Código QR del álbum de fotos' });
  if (qr) {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--texto').trim() || '#3d3d3d';
    cargarQr().then((QRCode) => {
      new QRCode(qr, { text: enlace, width: 176, height: 176, colorDark: color, colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
      qr.querySelectorAll('img').forEach((i) => { i.alt = ''; });
    }).catch(() => qr.remove());
  }
  return crear('section', {},
    crear('span', { clase: 'icono icono-camara', 'aria-hidden': 'true' }),
    titulo(sec, 'Sube tus fotos'),
    parrafos(sec.texto || 'Queremos ver este día a través de tus ojos. Sube tus fotos y videos a nuestro álbum.'),
    crear('hr', { clase: 'divisor' }),
    crear('a', { clase: 'boton', href: enlace, target: '_blank', rel: 'noopener' }, sec.texto_boton || 'Ir al álbum'),
    qr,
    qr ? crear('p', { clase: 'qr-nota' }, 'O escanea este código el día del evento') : null);
}
