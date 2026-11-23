// Calendario del mes con el día del evento marcado, y botones para guardarlo.
import { crear, mayuscula, partesFecha } from '../comun.js';
import { botonesCalendario, monograma, titulo } from './ayuda.js';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const NOMBRES_DIA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export default function calendario(sec, ctx) {
  const f = partesFecha(ctx.evento.fecha_hora);
  const iso = String(ctx.evento.fecha_hora || '').slice(0, 10);
  if (!f || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [anio, mes, dia] = iso.split('-').map(Number);
  const vacios = (new Date(Date.UTC(anio, mes - 1, 1)).getUTCDay() + 6) % 7; // la semana empieza el lunes
  const totalDias = new Date(Date.UTC(anio, mes, 0)).getUTCDate();

  const celdas = [...Array(vacios).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];
  while (celdas.length % 7) celdas.push(null);
  const filas = [];
  for (let i = 0; i < celdas.length; i += 7) {
    filas.push(crear('tr', {}, celdas.slice(i, i + 7).map((d, j) => {
      if (!d) return crear('td', {});
      if (d !== dia) return crear('td', {}, d);
      return crear('td', { clase: 'dia-evento' },
        crear('span', { 'aria-hidden': 'true' }, d),
        crear('span', { clase: 'visualmente-oculto' }, `${NOMBRES_DIA[j]} ${d}, día del evento`));
    })));
  }

  return crear('section', {},
    sec.monograma === false ? null : monograma(ctx),
    titulo(sec, 'Reserva esta fecha en tu calendario'),
    crear('table', { clase: 'mes' },
      crear('caption', {}, `${mayuscula(f.mes)} ${f.anio}`),
      crear('thead', {}, crear('tr', {}, DIAS.map((d) => crear('th', { scope: 'col' }, d)))),
      crear('tbody', {}, filas)),
    sec.boton === false ? null : botonesCalendario(ctx));
}
