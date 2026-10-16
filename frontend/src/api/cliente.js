import { obtenerToken } from '../auth/sesion.js'

export const USAR_SIMULACIONES = import.meta.env.VITE_USE_MOCKS === 'true'

const RUTA_LOGIN = '/auth/login'

export class ErrorApi extends Error {
  constructor({ status, codigo, mensaje, errores = [], cuerpo = null }) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.status = status
    this.codigo = codigo
    this.mensaje = mensaje
    this.errores = Array.isArray(errores) ? errores : []
    // Cuerpo completo para leer campos extra, como transformacionId en el 409 OPERACION_DUPLICADA.
    this.cuerpo = cuerpo
  }
}

let manejadorNoAutenticado = null

export function registrarManejadorNoAutenticado(fn) {
  manejadorNoAutenticado = typeof fn === 'function' ? fn : null
}

const MENSAJES_POR_STATUS = {
  400: 'Los datos enviados no son válidos. Revise el formulario.',
  401: 'Su sesión no es válida o venció. Inicie sesión de nuevo.',
  403: 'Su rol no tiene permiso para esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación entra en conflicto con el estado actual. Actualice la información e intente de nuevo.',
  422: 'La operación no cumple una regla de negocio.',
}

function mensajeGenerico(status) {
  if (MENSAJES_POR_STATUS[status]) return MENSAJES_POR_STATUS[status]
  if (status >= 500) return 'El servidor tuvo un problema o no está disponible. Intente de nuevo en unos segundos.'
  return `La solicitud no se pudo completar (HTTP ${status}).`
}

function construirUrl(ruta, consulta) {
  const parametros = new URLSearchParams()
  if (consulta) {
    for (const [clave, valor] of Object.entries(consulta)) {
      if (valor === null || valor === undefined || valor === '') continue
      parametros.append(clave, String(valor))
    }
  }
  const texto = parametros.toString()
  return '/api' + ruta + (texto ? `?${texto}` : '')
}

function nombreArchivoDesde(contentDisposition) {
  if (!contentDisposition) return null
  const codificado = /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i.exec(contentDisposition)
  if (codificado) {
    try {
      return decodeURIComponent(codificado[1].trim().replace(/^"|"$/g, ''))
    } catch {
      // Si no se puede decodificar se intenta con filename simple.
    }
  }
  const simple = /filename\s*=\s*"?([^";]+)"?/i.exec(contentDisposition)
  return simple ? simple[1].trim() : null
}

// Misma lógica para respuestas reales y simuladas: así el manejo de errores
// que se prueba en modo simulación es el mismo que corre contra el backend.
function lanzarErrorHttp(status, cuerpo, ruta) {
  const tieneFormatoContrato =
    cuerpo && typeof cuerpo === 'object' && typeof cuerpo.codigo === 'string' && typeof cuerpo.mensaje === 'string'

  const error = tieneFormatoContrato
    ? new ErrorApi({ status, codigo: cuerpo.codigo, mensaje: cuerpo.mensaje, errores: cuerpo.errores, cuerpo })
    : new ErrorApi({ status, codigo: `ERROR_HTTP_${status}`, mensaje: mensajeGenerico(status), cuerpo })

  if (status === 401 && ruta !== RUTA_LOGIN && manejadorNoAutenticado) {
    manejadorNoAutenticado(error)
  }
  throw error
}

async function leerJsonSeguro(respuesta) {
  const texto = await respuesta.text()
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    return undefined
  }
}

async function solicitarSimulado(metodo, ruta, { cuerpo, consulta, tipoRespuesta }, token) {
  const { responderSimulado } = await import('./simulaciones.js')
  const resultado = await responderSimulado({ metodo, ruta, consulta, cuerpo, token })

  if (resultado.status >= 200 && resultado.status < 300) {
    if (resultado.status === 204) return null
    if (tipoRespuesta === 'blob') {
      return { blob: resultado.cuerpo, nombreArchivo: resultado.nombreArchivo ?? null }
    }
    return resultado.cuerpo ?? null
  }
  return lanzarErrorHttp(resultado.status, resultado.cuerpo, ruta)
}

async function solicitar(metodo, ruta, { cuerpo, consulta, tipoRespuesta = 'json' } = {}) {
  const token = obtenerToken()

  if (USAR_SIMULACIONES) {
    return solicitarSimulado(metodo, ruta, { cuerpo, consulta, tipoRespuesta }, token)
  }

  const cabeceras = { Accept: 'application/json' }
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (token) cabeceras.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(construirUrl(ruta, consulta), {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ErrorApi({
      status: 0,
      codigo: 'SIN_CONEXION',
      mensaje: 'No se pudo conectar con el servidor. Verifique que el backend esté encendido y vuelva a intentarlo.',
    })
  }

  if (respuesta.ok) {
    if (respuesta.status === 204) return null
    if (tipoRespuesta === 'blob') {
      const blob = await respuesta.blob()
      return { blob, nombreArchivo: nombreArchivoDesde(respuesta.headers.get('Content-Disposition')) }
    }
    const datos = await leerJsonSeguro(respuesta)
    if (datos === undefined) {
      throw new ErrorApi({
        status: respuesta.status,
        codigo: 'RESPUESTA_INVALIDA',
        mensaje: 'El servidor envió una respuesta que no se pudo leer. Intente de nuevo en unos segundos.',
      })
    }
    return datos
  }

  const cuerpoError = await leerJsonSeguro(respuesta).catch(() => null)
  return lanzarErrorHttp(respuesta.status, cuerpoError ?? null, ruta)
}

export const api = {
  get: (ruta, consulta) => solicitar('GET', ruta, { consulta }),
  post: (ruta, cuerpo) => solicitar('POST', ruta, { cuerpo }),
  patch: (ruta, cuerpo) => solicitar('PATCH', ruta, { cuerpo }),
  descargar: (ruta, consulta) => solicitar('GET', ruta, { consulta, tipoRespuesta: 'blob' }),
}
