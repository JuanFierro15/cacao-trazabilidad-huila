import { api } from './cliente.js'

export function iniciarSesion(username, password) {
  return api.post('/auth/login', { username, password })
}

export function obtenerReglas() {
  return api.get('/config/reglas')
}

export function obtenerProductores() {
  return api.get('/productores')
}

export function obtenerLotes(filtros = {}) {
  return api.get('/lotes', filtros)
}

export function obtenerLote(codigo) {
  return api.get('/lotes/' + encodeURIComponent(codigo))
}

export function obtenerTrazabilidad(codigo) {
  return api.get('/lotes/' + encodeURIComponent(codigo) + '/trazabilidad')
}

export function obtenerFichaPublica(codigo) {
  return api.getPublico('/public/ficha/' + encodeURIComponent(codigo))
}

export function registrarLote(datos) {
  return api.post('/lotes', datos)
}

export function registrarTransformacion(datos) {
  return api.post('/transformaciones', datos)
}

export function obtenerTransformaciones(filtros = {}) {
  return api.get('/transformaciones', filtros)
}

export function obtenerAlertas(filtros = {}) {
  return api.get('/alertas', filtros)
}

export function obtenerBalance(id, precioVentaCop) {
  return api.get(
    '/transformaciones/' + encodeURIComponent(id) + '/balance',
    precioVentaCop === null || precioVentaCop === undefined ? undefined : { precioVentaCop },
  )
}

export function descargarCsv(filtros = {}) {
  return api.descargar('/reportes/exportar-csv', filtros)
}

export function cambiarEstadoLote(codigo, datos) {
  return api.patch('/lotes/' + encodeURIComponent(codigo) + '/estado', datos)
}

export function obtenerRecall(codigo) {
  return api.get('/lotes/' + encodeURIComponent(codigo) + '/recall')
}

export function obtenerAuditoria(filtros = {}) {
  return api.get('/auditoria', filtros)
}

