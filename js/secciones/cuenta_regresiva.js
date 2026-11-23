// Cuenta regresiva hasta la fecha del evento.
import { crear } from '../comun.js';
import { titulo } from './ayuda.js';

export default function cuentaRegresiva(sec, ctx) {
  const meta = new Date(ctx.evento.fecha_hora).getTime();
  if (isNaN(meta)) return null;
  const nombres = ['Días', 'Horas', 'Minutos', 'Segundos'];
  const numeros = nombres.map(() => crear('span', {}, '0'));
  const caja = crear('div', { clase: 'cuenta-regresiva', role: 'timer', 'aria-label': 'Tiempo que falta para el evento' },
    nombres.map((n, i) => crear('div', {}, numeros[i], crear('small', {}, n))));

  let reloj;
  let mostrada = false;
  const actualizar = () => {
    // Si la invitación se volvió a pintar, este reloj ya no se usa
    if (caja.isConnected) mostrada = true;
    else if (mostrada) { clearInterval(reloj); return; }
    const falta = meta - Date.now();
    if (falta <= 0) {
      caja.replaceChildren(crear('p', { clase: 'cr-final' }, sec.texto_final || '¡Hoy es el gran día!'));
      clearInterval(reloj);
      return;
    }
    const s = Math.floor(falta / 1000);
    const valores = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
    numeros.forEach((el, i) => { el.textContent = i === 0 ? valores[i] : String(valores[i]).padStart(2, '0'); });
  };
  reloj = setInterval(actualizar, 1000);
  actualizar();

  return crear('section', {},
    titulo(sec, ''),
    sec.subtitulo ? crear('p', { clase: 'cr-subtitulo' }, sec.subtitulo) : null,
    caja);
}
