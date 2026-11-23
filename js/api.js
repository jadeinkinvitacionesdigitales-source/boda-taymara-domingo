// Copia SOLO PARA REVISIÓN: no se conecta a ningún servidor.
// La confirmación de asistencia muestra el "¡Gracias!" pero no guarda nada.
export const modoDemo = false;

export async function evento() {
  throw new Error('En la copia de revisión los datos vienen de evento.json.');
}

export async function invitado() {
  throw new Error('La copia de revisión no tiene enlaces personales.');
}

export async function responder(slug, codigo, asiste, asistentes, mensaje) {
  return { nombre: '', puestos: asistentes || 1, estado: asiste ? 'confirmado' : 'no_asiste', asistentes, mensaje };
}

export async function responderGeneral(slug, nombre, asiste, asistentes, mensaje) {
  return { nombre, puestos: asistentes || 1, estado: asiste ? 'confirmado' : 'no_asiste', asistentes, mensaje };
}
