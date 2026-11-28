// Galería de fotos y, si hay, botón para que los invitados suban las suyas.
import { crear, enlaceSeguro } from '../comun.js';
import { foto, parrafos, titulo } from './ayuda.js';

export default function galeria(sec, ctx) {
  const fotos = Array.isArray(sec.fotos) ? sec.fotos : [];
  const subir = enlaceSeguro(sec.subir_fotos_url);
  if (!fotos.length && !subir) return null;
  // "estilo": "amplia" = foto a todo lo ancho con bordes de papel rasgado
  return crear('section', { clase: sec.estilo === 'amplia' ? 'galeria-amplia' : null },
    titulo(sec, ''),
    fotos.length ? crear('div', { clase: 'galeria-fotos' }, fotos.map((f, i) => foto(ctx, f, 'Foto ' + (i + 1), 'Foto ' + (i + 1)))) : null,
    subir ? crear('div', { clase: 'galeria-subir' },
      parrafos(sec.texto || 'Queremos ver este día a través de tus ojos. ¡Comparte tus fotos!'),
      crear('a', { clase: 'boton', href: subir, target: '_blank', rel: 'noopener' }, 'Sube tus fotos')) : null);
}
