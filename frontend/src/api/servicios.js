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
