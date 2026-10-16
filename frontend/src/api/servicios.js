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

export function registrarLote(datos) {
  return api.post('/lotes', datos)
}

export function registrarTransformacion(datos) {
  return api.post('/transformaciones', datos)
}

export function obtenerTransformaciones(filtros = {}) {
  return api.get('/transformaciones', filtros)
}
