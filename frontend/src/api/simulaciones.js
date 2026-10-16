import { formatearNumero } from '../utilidades/formato.js'

// Simulación del backend para avanzar antes de que existan los endpoints reales.
// Solo se descarga con VITE_USE_MOCKS=true (import dinámico en cliente.js).
// El estado vive en memoria y se reinicia al recargar la página.

const RETRASO_MS = 250
const MINUTOS_SESION = 480
const DESFASE_BOGOTA_MS = 5 * 60 * 60 * 1000
const PREFIJO_TOKEN = 'simulado.'

const ROL_OPERADOR = 'OPERADOR'
const ROL_ADMINISTRADOR = 'ADMINISTRADOR'
const AMBOS_ROLES = [ROL_OPERADOR, ROL_ADMINISTRADOR]
const SOLO_ADMINISTRADOR = [ROL_ADMINISTRADOR]

// --- Datos sembrados (V2 y sección 7 del contrato) ---

const usuarios = [
  { username: 'operador1', password: 'cacao123', rol: ROL_OPERADOR, nombreCompleto: 'Operador Demo' },
  { username: 'admin1', password: 'admin123', rol: ROL_ADMINISTRADOR, nombreCompleto: 'Administrador Demo' },
]

const productores = [
  {
    id: 1, codigoProductor: 'PRD-A', nombreProductor: 'Productor A', nombreFinca: 'Finca La Esperanza',
    municipio: 'Rivera', vereda: null, hectareasProductivas: 2.0, variedadCacao: 'CCN-51', cuotaMaximaKg: 1200,
  },
  {
    id: 2, codigoProductor: 'PRD-B', nombreProductor: 'Productor B', nombreFinca: 'Finca El Vergel',
    municipio: 'Campoalegre', vereda: null, hectareasProductivas: 3.5, variedadCacao: 'Trinitario', cuotaMaximaKg: 2100,
  },
  {
    id: 3, codigoProductor: 'PRD-C', nombreProductor: 'Productor C', nombreFinca: 'Finca Los Cámbulos',
    municipio: 'Algeciras', vereda: null, hectareasProductivas: 0.5, variedadCacao: 'Criollo', cuotaMaximaKg: 300,
  },
]

function loteRecepcionSemilla(id, codigoLote, productorId, origenMunicipio, porcentajeHumedad, cantidadRecibida) {
  return {
    id,
    codigoLote,
    tipoLote: 'RECEPCION',
    producto: 'Cacao seco',
    productorId,
    origenMunicipio,
    fechaRecepcion: '2026-10-14',
    tipoGrano: 'SECO',
    porcentajeHumedad,
    cantidadRecibida,
    cantidadConsumida: 0,
    cantidadDisponible: cantidadRecibida,
    unidad: 'kg',
    estado: 'PENDIENTE',
    motivoEstado: null,
    lotesPadre: [],
    alertasActivas: 0,
  }
}

const lotes = [
  loteRecepcionSemilla(1, 'CAC001', 1, 'Rivera', 7.5, 100),
  loteRecepcionSemilla(2, 'CAC002', 2, 'Campoalegre', 7.2, 150),
  loteRecepcionSemilla(3, 'CAC003', 3, 'Algeciras', 7.8, 80),
]

const alertas = []

const REGLAS = {
  umbralMermaPorcentaje: 15.0,
  rendimientoPlausibleKgHaAnio: 600,
  etapas: [
    { codigo: 'BENEFICIO_FERMENTACION_SECADO', nombre: 'Beneficio: fermentación y secado' },
    { codigo: 'LIMPIEZA_CLASIFICACION', nombre: 'Limpieza y clasificación' },
    { codigo: 'TOSTADO_ROASTING', nombre: 'Tostado' },
    { codigo: 'DESCASCARILLADO_WINNOWING', nombre: 'Descascarillado (nibs)' },
    { codigo: 'MOLIENDA_LICOR_CACAO', nombre: 'Molienda a licor de cacao' },
    { codigo: 'CONTROL_CALIDAD_EMPAQUE', nombre: 'Control de calidad y empaque' },
  ],
}

// --- Utilidades ---

function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms))
}

// Colombia no tiene horario de verano: el desfase es siempre -05:00.
function isoBogota(ms = Date.now()) {
  return new Date(ms - DESFASE_BOGOTA_MS).toISOString().slice(0, 19) + '-05:00'
}

function anioActualBogota() {
  return new Date(Date.now() - DESFASE_BOGOTA_MS).getUTCFullYear()
}

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

function respuesta(status, cuerpo) {
  return { status, cuerpo }
}

function respuestaError(status, codigo, mensaje, errores = []) {
  return respuesta(status, { timestamp: isoBogota(), status, codigo, mensaje, errores })
}

// --- Token simulado: 'simulado.' + base64 de { sub, rol, exp } ---

function crearToken(usuario, expiraMs) {
  const carga = { sub: usuario.username, rol: usuario.rol, exp: expiraMs }
  return PREFIJO_TOKEN + btoa(JSON.stringify(carga))
}

function leerToken(token) {
  if (typeof token !== 'string' || !token.startsWith(PREFIJO_TOKEN)) return null
  try {
    const carga = JSON.parse(atob(token.slice(PREFIJO_TOKEN.length)))
    if (!carga || typeof carga.sub !== 'string' || typeof carga.rol !== 'string') return null
    if (typeof carga.exp !== 'number' || carga.exp <= Date.now()) return null
    return carga
  } catch {
    return null
  }
}

// --- Transformación a las formas JSON del contrato ---

function aLoteDTO(lote) {
  const productor = productores.find((p) => p.id === lote.productorId)
  return {
    id: lote.id,
    codigoLote: lote.codigoLote,
    tipoLote: lote.tipoLote,
    producto: lote.producto,
    productor: productor
      ? {
          id: productor.id,
          codigoProductor: productor.codigoProductor,
          nombreProductor: productor.nombreProductor,
          nombreFinca: productor.nombreFinca,
        }
      : null,
    origenMunicipio: lote.origenMunicipio,
    fechaRecepcion: lote.fechaRecepcion,
    tipoGrano: lote.tipoGrano,
    porcentajeHumedad: lote.porcentajeHumedad,
    cantidadRecibida: lote.cantidadRecibida,
    cantidadConsumida: lote.cantidadConsumida,
    cantidadDisponible: lote.cantidadDisponible,
    unidad: lote.unidad,
    estado: lote.estado,
    motivoEstado: lote.motivoEstado,
    lotesPadre: lote.lotesPadre,
    alertasActivas: lote.alertasActivas,
  }
}

function aProductorDTO(productor) {
  const anio = String(anioActualBogota())
  const entregadoAnioKg = lotes
    .filter(
      (l) => l.tipoLote === 'RECEPCION' && l.productorId === productor.id && l.fechaRecepcion.startsWith(`${anio}-`),
    )
    .reduce((suma, l) => suma + l.cantidadRecibida, 0)
  return { ...productor, entregadoAnioKg }
}

// --- Manejadores ---

function manejarLogin({ cuerpo }) {
  const username = texto(cuerpo?.username)
  const password = typeof cuerpo?.password === 'string' ? cuerpo.password : ''

  const errores = []
  if (!username) errores.push({ campo: 'username', mensaje: 'Es obligatorio' })
  if (!password) errores.push({ campo: 'password', mensaje: 'Es obligatorio' })
  if (errores.length > 0) {
    return respuestaError(400, 'VALIDACION', 'Hay datos obligatorios sin completar. Revise los campos marcados.', errores)
  }

  const usuario = usuarios.find((u) => u.username === username && u.password === password)
  if (!usuario) {
    return respuestaError(
      401,
      'CREDENCIALES_INVALIDAS',
      'Usuario o contraseña incorrectos. Verifique los datos e intente de nuevo.',
    )
  }

  const expiraMs = Date.now() + MINUTOS_SESION * 60 * 1000
  return respuesta(200, {
    token: crearToken(usuario, expiraMs),
    username: usuario.username,
    nombreCompleto: usuario.nombreCompleto,
    rol: usuario.rol,
    expiraEn: isoBogota(expiraMs),
  })
}

function manejarReglas() {
  return respuesta(200, REGLAS)
}

function manejarProductores() {
  return respuesta(200, productores.map(aProductorDTO))
}

function manejarListaLotes({ consulta }) {
  const origen = texto(consulta?.origen).toLocaleLowerCase('es-CO')
  const estado = texto(consulta?.estado)
  const tipo = texto(consulta?.tipo)

  const resultado = lotes
    .filter((l) => !origen || l.origenMunicipio.toLocaleLowerCase('es-CO') === origen)
    .filter((l) => !estado || l.estado === estado)
    .filter((l) => !tipo || l.tipoLote === tipo)
    .sort((a, b) => a.codigoLote.localeCompare(b.codigoLote))
    .map(aLoteDTO)

  return respuesta(200, resultado)
}

function manejarDetalleLote({ parametros }) {
  const codigo = parametros[0]
  const lote = lotes.find((l) => l.codigoLote === codigo)
  if (!lote) return respuestaError(404, 'NO_ENCONTRADO', `No existe el lote ${codigo}.`)
  return respuesta(200, aLoteDTO(lote))
}

function manejarCrearLote({ cuerpo }) {
  const errores = []

  const productorId = cuerpo?.productorId
  if (productorId === null || productorId === undefined || productorId === '') {
    errores.push({ campo: 'productorId', mensaje: 'Es obligatorio' })
  } else if (!Number.isInteger(productorId) || !productores.some((p) => p.id === productorId)) {
    errores.push({ campo: 'productorId', mensaje: 'No existe el productor seleccionado' })
  }

  const fechaTexto = texto(cuerpo?.fechaRecepcion)
  if (!fechaTexto) {
    errores.push({ campo: 'fechaRecepcion', mensaje: 'Es obligatorio' })
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaTexto)) {
    errores.push({ campo: 'fechaRecepcion', mensaje: 'Use una fecha válida (AAAA-MM-DD)' })
  } else {
    const [anio, mes, dia] = fechaTexto.split('-').map(Number)
    const dt = new Date(Date.UTC(anio, mes - 1, dia))
    if (dt.getUTCFullYear() !== anio || dt.getUTCMonth() + 1 !== mes || dt.getUTCDate() !== dia) {
      errores.push({ campo: 'fechaRecepcion', mensaje: 'Use una fecha válida (AAAA-MM-DD)' })
    }
  }

  const tipoGrano = cuerpo?.tipoGrano
  if (tipoGrano === null || tipoGrano === undefined || tipoGrano === '') {
    errores.push({ campo: 'tipoGrano', mensaje: 'Es obligatorio' })
  } else if (tipoGrano !== 'SECO' && tipoGrano !== 'BABA') {
    errores.push({ campo: 'tipoGrano', mensaje: 'Debe ser SECO o BABA' })
  }

  const humedad = cuerpo?.porcentajeHumedad
  if (humedad !== null && humedad !== undefined) {
    if (typeof humedad !== 'number' || !Number.isFinite(humedad)) {
      errores.push({ campo: 'porcentajeHumedad', mensaje: 'Debe ser un número' })
    } else if (humedad < 0 || humedad > 100) {
      errores.push({ campo: 'porcentajeHumedad', mensaje: 'Debe estar entre 0 y 100' })
    }
  }

  const cantidad = cuerpo?.cantidadRecibida
  if (cantidad === null || cantidad === undefined || cantidad === '') {
    errores.push({ campo: 'cantidadRecibida', mensaje: 'Es obligatorio' })
  } else if (typeof cantidad !== 'number' || !Number.isFinite(cantidad)) {
    errores.push({ campo: 'cantidadRecibida', mensaje: 'Debe ser un número' })
  } else if (cantidad <= 0) {
    errores.push({ campo: 'cantidadRecibida', mensaje: 'Debe ser mayor que 0' })
  }

  const codigoLimpio = texto(cuerpo?.codigoLote)
  if (codigoLimpio && !/^[A-Z0-9-]{3,30}$/.test(codigoLimpio)) {
    errores.push({ campo: 'codigoLote', mensaje: 'Use de 3 a 30 caracteres: letras mayúsculas, números o guion' })
  }

  if (errores.length > 0) {
    return respuestaError(
      400,
      'VALIDACION',
      'Hay datos inválidos o sin completar. Revise los campos marcados.',
      errores,
    )
  }

  if (codigoLimpio && lotes.some((l) => l.codigoLote === codigoLimpio)) {
    return respuestaError(
      409,
      'LOTE_DUPLICADO',
      `Ya existe un lote con el código ${codigoLimpio}. Use otro código o deje el campo vacío para que el sistema asigne uno.`,
    )
  }

  let codigoFinal = codigoLimpio
  if (!codigoFinal) {
    let maxNum = 0
    for (const l of lotes) {
      const match = /^CAC(\d+)$/.exec(l.codigoLote)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    }
    codigoFinal = `CAC${String(maxNum + 1).padStart(3, '0')}`
  }

  const anioLote = fechaTexto.slice(0, 4)
  const productor = productores.find((p) => p.id === productorId)
  const previo = lotes
    .filter(
      (l) => l.tipoLote === 'RECEPCION' && l.productorId === productor.id && l.fechaRecepcion.startsWith(`${anioLote}-`),
    )
    .reduce((suma, l) => suma + l.cantidadRecibida, 0)
  const cantidadRedondeada = Math.round(cantidad * 1000) / 1000
  const total = Math.round((previo + cantidadRedondeada) * 1000) / 1000
  const alertasGeneradas = []

  if (total > productor.cuotaMaximaKg) {
    const siguienteIdAlerta = alertas.length > 0 ? Math.max(...alertas.map((a) => a.id)) + 1 : 1
    const cuotaFormateada = formatearNumero(productor.cuotaMaximaKg, 3)
    const hectareasFormateada = formatearNumero(productor.hectareasProductivas, 2)
    const reglaAplicada = `Entregas del año por encima de la cuota de plausibilidad de la finca (${cuotaFormateada} kg)`
    const causa = `${productor.nombreProductor} (${productor.nombreFinca}, ${hectareasFormateada} ha) suma ${formatearNumero(total, 3)} kg en ${anioLote}: ${formatearNumero(previo, 3)} kg entregados antes y ${formatearNumero(cantidadRedondeada, 3)} kg en este lote. La cuota es de ${cuotaFormateada} kg (${hectareasFormateada} ha × ${formatearNumero(REGLAS.rendimientoPlausibleKgHaAnio, 3)} kg/ha/año). La recepción quedó registrada; verifique el origen del grano.`

    const alerta = {
      id: siguienteIdAlerta,
      tipoAlerta: 'CUOTA_EXCEDIDA',
      loteCodigo: codigoFinal,
      transformacionId: null,
      reglaAplicada,
      causa,
      valorMedido: total,
      umbral: productor.cuotaMaximaKg,
      fechaGeneracion: isoBogota(),
      activa: true,
    }
    alertas.push(alerta)
    alertasGeneradas.push(alerta)
  }

  const siguienteIdLote = lotes.length > 0 ? Math.max(...lotes.map((l) => l.id)) + 1 : 1
  const nuevoLote = {
    id: siguienteIdLote,
    codigoLote: codigoFinal,
    tipoLote: 'RECEPCION',
    producto: tipoGrano === 'SECO' ? 'Cacao seco' : 'Cacao en baba',
    productorId: productor.id,
    origenMunicipio: productor.municipio,
    fechaRecepcion: fechaTexto,
    tipoGrano,
    porcentajeHumedad: humedad !== undefined && humedad !== null ? humedad : null,
    cantidadRecibida: cantidadRedondeada,
    cantidadConsumida: 0,
    cantidadDisponible: cantidadRedondeada,
    unidad: 'kg',
    estado: 'PENDIENTE',
    motivoEstado: null,
    lotesPadre: [],
    alertasActivas: alertasGeneradas.length,
  }
  lotes.push(nuevoLote)

  return respuesta(201, { lote: aLoteDTO(nuevoLote), alertasGeneradas })
}

// --- Tabla de rutas: matriz completa de la sección 7 ---
// Las rutas sin manejador existen para que los permisos (401/403) se simulen
// igual que en el backend aunque la función aún no esté construida.

const RUTAS = [
  { metodo: 'POST', patron: /^\/auth\/login$/, roles: null, manejador: manejarLogin },
  { metodo: 'GET', patron: /^\/public\/ficha\/([^/]+)$/, roles: null },

  { metodo: 'GET', patron: /^\/config\/reglas$/, roles: AMBOS_ROLES, manejador: manejarReglas },
  { metodo: 'GET', patron: /^\/productores$/, roles: AMBOS_ROLES, manejador: manejarProductores },
  { metodo: 'POST', patron: /^\/lotes$/, roles: AMBOS_ROLES, manejador: manejarCrearLote },
  { metodo: 'GET', patron: /^\/lotes$/, roles: AMBOS_ROLES, manejador: manejarListaLotes },
  { metodo: 'GET', patron: /^\/lotes\/([^/]+)$/, roles: AMBOS_ROLES, manejador: manejarDetalleLote },
  { metodo: 'GET', patron: /^\/lotes\/([^/]+)\/trazabilidad$/, roles: AMBOS_ROLES },
  { metodo: 'POST', patron: /^\/transformaciones$/, roles: AMBOS_ROLES },
  { metodo: 'GET', patron: /^\/transformaciones$/, roles: AMBOS_ROLES },

  {
    metodo: 'PATCH',
    patron: /^\/lotes\/([^/]+)\/estado$/,
    roles: SOLO_ADMINISTRADOR,
    mensajeAccesoDenegado: 'Solo el Administrador puede liberar o bloquear lotes.',
  },
  { metodo: 'GET', patron: /^\/lotes\/([^/]+)\/recall$/, roles: SOLO_ADMINISTRADOR },
  { metodo: 'GET', patron: /^\/transformaciones\/([^/]+)\/balance$/, roles: SOLO_ADMINISTRADOR },
  { metodo: 'GET', patron: /^\/alertas$/, roles: SOLO_ADMINISTRADOR },
  { metodo: 'GET', patron: /^\/auditoria$/, roles: SOLO_ADMINISTRADOR },
  { metodo: 'GET', patron: /^\/reportes\/exportar-csv$/, roles: SOLO_ADMINISTRADOR },
]

function buscarRuta(metodo, ruta) {
  for (const definicion of RUTAS) {
    if (definicion.metodo !== metodo) continue
    const coincidencia = definicion.patron.exec(ruta)
    if (coincidencia) {
      const parametros = coincidencia.slice(1).map((p) => {
        try {
          return decodeURIComponent(p)
        } catch {
          return p
        }
      })
      return { definicion, parametros }
    }
  }
  return null
}

function despachar({ metodo, ruta, consulta, cuerpo, token }) {
  const encontrada = buscarRuta(metodo, ruta)
  if (!encontrada) {
    return respuestaError(404, 'NO_ENCONTRADO', `La ruta ${metodo} /api${ruta} no existe.`)
  }
  const { definicion, parametros } = encontrada

  let usuario = null
  if (definicion.roles !== null) {
    usuario = leerToken(token)
    if (!usuario) return respuestaError(401, 'NO_AUTENTICADO', 'Debe iniciar sesión para continuar.')

    if (!definicion.roles.includes(usuario.rol)) {
      const mensaje = definicion.mensajeAccesoDenegado ?? 'Su rol no tiene permiso para esta acción.'
      return respuestaError(403, 'ACCESO_DENEGADO', mensaje)
    }
  }

  if (!definicion.manejador) {
    return respuestaError(
      501,
      'NO_IMPLEMENTADO_EN_SIMULACION',
      'Esta función todavía no está disponible en modo simulación.',
    )
  }

  return definicion.manejador({ parametros, consulta, cuerpo, usuario })
}

export async function responderSimulado({ metodo, ruta, consulta, cuerpo, token }) {
  await esperar(RETRASO_MS)
  const resultado = despachar({ metodo: String(metodo).toUpperCase(), ruta, consulta, cuerpo, token })
  // Copia profunda: la interfaz nunca debe poder modificar el estado interno.
  return structuredClone(resultado)
}
