export const ROLES = {
  OPERADOR: 'OPERADOR',
  ADMINISTRADOR: 'ADMINISTRADOR',
}

const ETIQUETAS_ROL = {
  [ROLES.OPERADOR]: 'Operador',
  [ROLES.ADMINISTRADOR]: 'Administrador',
}

export function etiquetaRol(rol) {
  return ETIQUETAS_ROL[rol] ?? rol ?? ''
}

export function rutaInicioPorRol(rol) {
  return rol === ROLES.ADMINISTRADOR ? '/admin' : '/operador'
}
