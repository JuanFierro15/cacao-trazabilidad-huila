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
    raizCodigo: codigoLote,
  }
}

const lotes = [
  loteRecepcionSemilla(1, 'CAC001', 1, 'Rivera', 7.5, 100),
  loteRecepcionSemilla(2, 'CAC002', 2, 'Campoalegre', 7.2, 150),
  loteRecepcionSemilla(3, 'CAC003', 3, 'Algeciras', 7.8, 80),
]

const transformaciones = []
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

function redondear(valor, decimales) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return valor
  const signo = valor < 0 ? -1 : 1
  const abs = Math.abs(valor)
  const factor = Number(abs + 'e' + decimales)
  const redondeado = Math.round(factor)
  return signo * Number(redondeado + 'e-' + decimales)
}

function respuesta(status, cuerpo) {
  return { status, cuerpo }
}

function respuestaError(status, codigo, mensaje, errores = [], extra = {}) {
  return respuesta(status, { timestamp: isoBogota(), status, codigo, mensaje, errores, ...extra })
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
    raizCodigo: codigoFinal,
  }
  lotes.push(nuevoLote)

  return respuesta(201, { lote: aLoteDTO(nuevoLote), alertasGeneradas })
}

function aTransformacionDTO(t) {
  return {
    id: t.id,
    operacionUuid: t.operacionUuid,
    loteOrigenCodigo: t.loteOrigenCodigo,
    loteSalidaCodigo: t.loteSalidaCodigo,
    etapa: t.etapa,
    responsable: t.responsable,
    fechaTransformacion: t.fechaTransformacion,
    cantidadEntrada: t.cantidadEntrada,
    cantidadSalida: t.cantidadSalida,
    porcentajeMerma: t.porcentajeMerma,
    porcentajeRendimiento: t.porcentajeRendimiento,
    justificacionIncidencia: t.justificacionIncidencia,
    insumosAgregados: t.insumosAgregados,
  }
}

function manejarCrearTransformacion({ cuerpo, usuario }) {
  const errores = []

  const operacionUuid = texto(cuerpo?.operacionUuid)
  if (!operacionUuid) {
    errores.push({ campo: 'operacionUuid', mensaje: 'Es obligatorio' })
  } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(operacionUuid)) {
    errores.push({ campo: 'operacionUuid', mensaje: 'Debe ser un UUID válido' })
  }

  const loteOrigenCodigo = texto(cuerpo?.loteOrigenCodigo)
  if (!loteOrigenCodigo) {
    errores.push({ campo: 'loteOrigenCodigo', mensaje: 'Es obligatorio' })
  }

  const etapa = texto(cuerpo?.etapa)
  if (!etapa) {
    errores.push({ campo: 'etapa', mensaje: 'Es obligatorio' })
  } else if (!REGLAS.etapas.some((e) => e.codigo === etapa)) {
    errores.push({ campo: 'etapa', mensaje: 'Etapa no válida' })
  }

  const responsable = texto(cuerpo?.responsable)
  if (!responsable) {
    errores.push({ campo: 'responsable', mensaje: 'Es obligatorio' })
  } else if (responsable.length > 120) {
    errores.push({ campo: 'responsable', mensaje: 'Máximo 120 caracteres' })
  }

  const fechaTransformacion = texto(cuerpo?.fechaTransformacion)
  if (!fechaTransformacion) {
    errores.push({ campo: 'fechaTransformacion', mensaje: 'Es obligatorio' })
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaTransformacion)) {
    errores.push({ campo: 'fechaTransformacion', mensaje: 'Use una fecha válida (AAAA-MM-DD)' })
  } else {
    const [anio, mes, dia] = fechaTransformacion.split('-').map(Number)
    const dt = new Date(Date.UTC(anio, mes - 1, dia))
    if (dt.getUTCFullYear() !== anio || dt.getUTCMonth() + 1 !== mes || dt.getUTCDate() !== dia) {
      errores.push({ campo: 'fechaTransformacion', mensaje: 'Use una fecha válida (AAAA-MM-DD)' })
    }
  }

  const entradaRaw = cuerpo?.cantidadEntrada
  if (entradaRaw === null || entradaRaw === undefined || entradaRaw === '') {
    errores.push({ campo: 'cantidadEntrada', mensaje: 'Es obligatorio' })
  } else if (typeof entradaRaw !== 'number' || !Number.isFinite(entradaRaw)) {
    errores.push({ campo: 'cantidadEntrada', mensaje: 'Debe ser un número' })
  } else if (entradaRaw <= 0) {
    errores.push({ campo: 'cantidadEntrada', mensaje: 'Debe ser mayor que 0' })
  }

  const salidaRaw = cuerpo?.cantidadSalida
  if (salidaRaw === null || salidaRaw === undefined || salidaRaw === '') {
    errores.push({ campo: 'cantidadSalida', mensaje: 'Es obligatorio' })
  } else if (typeof salidaRaw !== 'number' || !Number.isFinite(salidaRaw)) {
    errores.push({ campo: 'cantidadSalida', mensaje: 'Debe ser un número' })
  } else if (salidaRaw < 0) {
    errores.push({ campo: 'cantidadSalida', mensaje: 'No puede ser negativa' })
  }

  const productoSalida = texto(cuerpo?.productoSalida)
  const salidaEsValidaMayorCero =
    typeof salidaRaw === 'number' && Number.isFinite(salidaRaw) && salidaRaw > 0
  if (salidaEsValidaMayorCero && !productoSalida) {
    errores.push({ campo: 'productoSalida', mensaje: 'Es obligatorio cuando la salida es mayor que 0' })
  }

  const justificacionIncidencia = texto(cuerpo?.justificacionIncidencia)
  if (justificacionIncidencia.length > 500) {
    errores.push({ campo: 'justificacionIncidencia', mensaje: 'Máximo 500 caracteres' })
  }

  const detalleCostosIncluidos = texto(cuerpo?.detalleCostosIncluidos)
  if (detalleCostosIncluidos.length > 500) {
    errores.push({ campo: 'detalleCostosIncluidos', mensaje: 'Máximo 500 caracteres' })
  }

  const insumosAgregados = texto(cuerpo?.insumosAgregados)
  if (insumosAgregados.length > 300) {
    errores.push({ campo: 'insumosAgregados', mensaje: 'Máximo 300 caracteres' })
  }

  const tempRaw = cuerpo?.temperaturaProceso
  if (tempRaw !== null && tempRaw !== undefined && tempRaw !== '') {
    if (typeof tempRaw !== 'number' || !Number.isFinite(tempRaw)) {
      errores.push({ campo: 'temperaturaProceso', mensaje: 'Debe ser un número' })
    }
  }

  const humRaw = cuerpo?.humedadSalida
  if (humRaw !== null && humRaw !== undefined && humRaw !== '') {
    if (typeof humRaw !== 'number' || !Number.isFinite(humRaw)) {
      errores.push({ campo: 'humedadSalida', mensaje: 'Debe ser un número' })
    } else if (humRaw < 0 || humRaw > 100) {
      errores.push({ campo: 'humedadSalida', mensaje: 'Debe estar entre 0 y 100' })
    }
  }

  const costoRaw = cuerpo?.costoEtapaCop
  if (costoRaw !== null && costoRaw !== undefined && costoRaw !== '') {
    if (typeof costoRaw !== 'number' || !Number.isFinite(costoRaw)) {
      errores.push({ campo: 'costoEtapaCop', mensaje: 'Debe ser un número' })
    } else if (costoRaw < 0) {
      errores.push({ campo: 'costoEtapaCop', mensaje: 'No puede ser negativo' })
    }
  }

  const precioRaw = cuerpo?.precioVentaEstimadoCop
  if (precioRaw !== null && precioRaw !== undefined && precioRaw !== '') {
    if (typeof precioRaw !== 'number' || !Number.isFinite(precioRaw)) {
      errores.push({ campo: 'precioVentaEstimadoCop', mensaje: 'Debe ser un número' })
    } else if (precioRaw < 0) {
      errores.push({ campo: 'precioVentaEstimadoCop', mensaje: 'No puede ser negativo' })
    }
  }

  if (errores.length > 0) {
    return respuestaError(
      400,
      'VALIDACION',
      'Hay datos inválidos o sin completar. Revise los campos marcados.',
      errores,
    )
  }

  const existente = transformaciones.find(
    (t) => t.operacionUuid.toLowerCase() === operacionUuid.toLowerCase(),
  )
  if (existente) {
    return respuestaError(
      409,
      'OPERACION_DUPLICADA',
      `Esta operación ya fue registrada (transformación #${existente.id}). No se aplicó de nuevo y el inventario no cambió.`,
      [],
      { transformacionId: existente.id },
    )
  }

  const origen = lotes.find((l) => l.codigoLote === loteOrigenCodigo)
  if (!origen) {
    return respuestaError(404, 'NO_ENCONTRADO', `No existe el lote ${loteOrigenCodigo}.`)
  }

  if (origen.estado === 'BLOQUEADO') {
    return respuestaError(
      409,
      'LOTE_BLOQUEADO',
      `El lote ${origen.codigoLote} está bloqueado y no se puede transformar. Un administrador debe liberarlo primero.`,
    )
  }

  const e = Math.round(entradaRaw * 1000) / 1000
  if (e > origen.cantidadDisponible) {
    return respuestaError(
      422,
      'INVENTARIO_INSUFICIENTE',
      `El lote ${origen.codigoLote} tiene ${formatearNumero(origen.cantidadDisponible, 3)} kg disponibles y la operación pide ${formatearNumero(e, 3)} kg. No se registró ningún cambio.`,
    )
  }

  const s = Math.round(salidaRaw * 1000) / 1000
  if (s > e && !insumosAgregados) {
    return respuestaError(
      422,
      'SALIDA_SIN_JUSTIFICACION',
      `La salida (${formatearNumero(s, 3)} kg) supera la entrada (${formatearNumero(e, 3)} kg). Registre los insumos agregados o corrija las cantidades. No se registró ningún cambio.`,
    )
  }

  const merma = Math.round(((e - s) / e) * 10000) / 100
  const rendimiento = Math.round((s / e) * 10000) / 100
  const costoUnitarioCop =
    typeof costoRaw === 'number' && Number.isFinite(costoRaw) && s > 0
      ? Math.round((costoRaw / s) * 100) / 100
      : null
  const margenPorcentaje =
    costoUnitarioCop !== null && typeof precioRaw === 'number' && Number.isFinite(precioRaw) && precioRaw > 0
      ? Math.round(((precioRaw - costoUnitarioCop) / precioRaw) * 10000) / 100
      : null

  origen.cantidadConsumida = Math.round((origen.cantidadConsumida + e) * 1000) / 1000
  origen.cantidadDisponible = Math.round((origen.cantidadRecibida - origen.cantidadConsumida) * 1000) / 1000

  let codigoDerivado = null
  if (s > 0) {
    const raiz = origen.raizCodigo || origen.codigoLote
    const n = lotes.filter((l) => l.tipoLote === 'DERIVADO' && l.raizCodigo === raiz).length + 1
    codigoDerivado = `${raiz}-T${n}`
    const siguienteIdLote = lotes.length > 0 ? Math.max(...lotes.map((l) => l.id)) + 1 : 1
    const nuevoLoteDerivado = {
      id: siguienteIdLote,
      codigoLote: codigoDerivado,
      tipoLote: 'DERIVADO',
      producto: productoSalida,
      productorId: origen.productorId,
      origenMunicipio: origen.origenMunicipio,
      fechaRecepcion: fechaTransformacion,
      tipoGrano: null,
      porcentajeHumedad:
        typeof humRaw === 'number' && Number.isFinite(humRaw) ? humRaw : null,
      cantidadRecibida: s,
      cantidadConsumida: 0,
      cantidadDisponible: s,
      unidad: 'kg',
      estado: 'PENDIENTE',
      motivoEstado: null,
      alertasActivas: 0,
      raizCodigo: raiz,
      // el contrato no fija la forma de lotesPadre; la interfaz no depende de ella.
      lotesPadre: [origen.codigoLote],
    }
    lotes.push(nuevoLoteDerivado)
  }

  const siguienteIdTransformacion =
    transformaciones.length > 0 ? Math.max(...transformaciones.map((t) => t.id)) + 1 : 1
  const nuevaTransformacion = {
    id: siguienteIdTransformacion,
    operacionUuid,
    loteOrigenCodigo: origen.codigoLote,
    loteSalidaCodigo: codigoDerivado,
    etapa,
    responsable,
    fechaTransformacion,
    cantidadEntrada: e,
    cantidadSalida: s,
    porcentajeMerma: merma,
    porcentajeRendimiento: rendimiento,
    justificacionIncidencia: justificacionIncidencia || null,
    insumosAgregados: insumosAgregados || null,
    temperaturaProceso:
      typeof tempRaw === 'number' && Number.isFinite(tempRaw) ? tempRaw : null,
    humedadSalida:
      typeof humRaw === 'number' && Number.isFinite(humRaw) ? humRaw : null,
    costoEtapaCop:
      typeof costoRaw === 'number' && Number.isFinite(costoRaw) ? costoRaw : null,
    precioVentaEstimadoCop:
      typeof precioRaw === 'number' && Number.isFinite(precioRaw) ? precioRaw : null,
    detalleCostosIncluidos: detalleCostosIncluidos || null,
    costoUnitarioCop,
    margenPorcentaje,
    registradoPor: usuario?.sub ?? 'operador1',
    fechaRegistro: isoBogota(),
  }
  transformaciones.push(nuevaTransformacion)

  const umbral = REGLAS.umbralMermaPorcentaje
  const umbralTexto = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(umbral)
  const justificacionSinPunto = justificacionIncidencia ? justificacionIncidencia.replace(/\.+$/, '') : ''
  const mermaStr = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(merma)
  const eStr = formatearNumero(e, 3)
  const sStr = formatearNumero(s, 3)
  const alertasGeneradas = []

  let siguienteIdAlerta = alertas.length > 0 ? Math.max(...alertas.map((a) => a.id)) + 1 : 1

  if (merma > umbral) {
    const causaMerma = `Merma calculada de ${mermaStr} % (${eStr} kg → ${sStr} kg) en ${etapa}. ${
      justificacionSinPunto ? `Causa registrada por el operador: ${justificacionSinPunto}.` : 'Sin causa registrada por el operador.'
    }`
    const alertaMerma = {
      id: siguienteIdAlerta++,
      tipoAlerta: 'MERMA_ALTA',
      loteCodigo: origen.codigoLote,
      transformacionId: nuevaTransformacion.id,
      reglaAplicada: `Merma de una etapa mayor a ${umbralTexto} %`,
      causa: causaMerma,
      valorMedido: merma,
      umbral,
      fechaGeneracion: isoBogota(),
      activa: true,
    }
    alertas.push(alertaMerma)
    alertasGeneradas.push(alertaMerma)

    if (!justificacionIncidencia) {
      const alertaIncompleto = {
        id: siguienteIdAlerta++,
        tipoAlerta: 'REGISTRO_INCOMPLETO',
        loteCodigo: origen.codigoLote,
        transformacionId: nuevaTransformacion.id,
        reglaAplicada: `Merma mayor a ${umbralTexto} % sin causa registrada`,
        causa: `La merma de ${mermaStr} % en ${etapa} supera el umbral y el operador no registró la causa.`,
        valorMedido: merma,
        umbral,
        fechaGeneracion: isoBogota(),
        activa: true,
      }
      alertas.push(alertaIncompleto)
      alertasGeneradas.push(alertaIncompleto)
    }
  }

  if (margenPorcentaje !== null && margenPorcentaje < 0) {
    const margenStr = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(margenPorcentaje)
    const alertaSobrecosto = {
      id: siguienteIdAlerta++,
      tipoAlerta: 'SOBRECOSTO',
      loteCodigo: origen.codigoLote,
      transformacionId: nuevaTransformacion.id,
      reglaAplicada: 'Margen sobre venta negativo',
      causa: `Con un costo unitario de ${formatearNumero(costoUnitarioCop, 2)} COP/kg y un precio de ${formatearNumero(precioRaw, 2)} COP/kg, el margen es ${margenStr} %.`,
      valorMedido: margenPorcentaje,
      umbral: 0,
      fechaGeneracion: isoBogota(),
      activa: true,
    }
    alertas.push(alertaSobrecosto)
    alertasGeneradas.push(alertaSobrecosto)
  }

  origen.alertasActivas += alertasGeneradas.length

  return respuesta(201, {
    transformacion: aTransformacionDTO(nuevaTransformacion),
    inventarioOrigen: {
      codigoLote: origen.codigoLote,
      cantidadRecibida: origen.cantidadRecibida,
      cantidadConsumida: origen.cantidadConsumida,
      cantidadDisponible: origen.cantidadDisponible,
    },
    alertasGeneradas,
  })
}

function manejarListaTransformaciones({ consulta }) {
  const loteCodigo = texto(consulta?.loteCodigo)
  const resultado = transformaciones
    .filter((t) => !loteCodigo || t.loteOrigenCodigo === loteCodigo || t.loteSalidaCodigo === loteCodigo)
    .sort((a, b) => a.id - b.id)
    .map(aTransformacionDTO)
  return respuesta(200, resultado)
}

function manejarListaAlertas({ consulta }) {
  const activaParam =
    consulta?.activa !== undefined && consulta?.activa !== null
      ? String(consulta.activa).trim()
      : ''
  const loteCodigoParam = texto(consulta?.loteCodigo)

  let resultado = alertas.slice()

  if (activaParam === 'true') {
    resultado = resultado.filter((a) => a.activa === true)
  } else if (activaParam === 'false') {
    resultado = resultado.filter((a) => a.activa === false)
  }

  if (loteCodigoParam) {
    resultado = resultado.filter((a) => a.loteCodigo === loteCodigoParam)
  }

  resultado.sort((a, b) => {
    const difFecha = new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime()
    if (difFecha !== 0) return difFecha
    return b.id - a.id
  })

  const dtos = resultado.map((a) => ({
    id: a.id,
    tipoAlerta: a.tipoAlerta,
    loteCodigo: a.loteCodigo,
    transformacionId: a.transformacionId,
    reglaAplicada: a.reglaAplicada,
    causa: a.causa,
    valorMedido: a.valorMedido,
    umbral: a.umbral,
    fechaGeneracion: a.fechaGeneracion,
    activa: a.activa,
  }))

  return respuesta(200, dtos)
}

function manejarBalance({ parametros, consulta }) {
  const idStr = parametros[0]
  const transformacion = transformaciones.find((t) => String(t.id) === String(idStr))

  const tienePrecioParam =
    consulta?.precioVentaCop !== undefined &&
    consulta?.precioVentaCop !== null &&
    consulta?.precioVentaCop !== ''

  let precioSimulado = null
  if (tienePrecioParam) {
    const raw = consulta.precioVentaCop
    const num = typeof raw === 'number' ? raw : Number(raw)
    if (typeof raw === 'boolean' || Number.isNaN(num) || !Number.isFinite(num)) {
      return respuestaError(
        400,
        'VALIDACION',
        'Hay datos inválidos o sin completar. Revise los campos marcados.',
        [{ campo: 'precioVentaCop', mensaje: 'Debe ser un número' }],
      )
    }
    if (num < 0) {
      return respuestaError(
        400,
        'VALIDACION',
        'El precio de venta simulado no puede ser negativo.',
        [{ campo: 'precioVentaCop', mensaje: 'El precio de venta no puede ser negativo' }],
      )
    }
    precioSimulado = num
  }

  if (!transformacion) {
    return respuestaError(
      404,
      'NO_ENCONTRADO',
      `No existe una transformación con el identificador ${idStr}.`,
    )
  }

  const esSimulacion = tienePrecioParam
  const precioEfectivo = tienePrecioParam
    ? precioSimulado
    : (transformacion.precioVentaEstimadoCop ?? null)

  const kgSalidaTexto = formatearNumero(transformacion.cantidadSalida, 3)
  const supuestos = [
    `Salida vendible = cantidad de salida registrada (${kgSalidaTexto} kg).`,
    'Precio de venta hipotético del ejercicio.',
    'Valores del caso simulado; no son estándares agronómicos ni de mercado.',
  ]

  let calculable = true
  let costoUnitarioCop = null
  let margenPorcentaje = null
  let motivoNoCalculable = null
  let formulaCostoUnitario = ''
  let formulaMargen = ''

  if (transformacion.cantidadSalida === 0) {
    calculable = false
    costoUnitarioCop = null
    margenPorcentaje = null
    motivoNoCalculable =
      'No se puede calcular: la salida vendible es 0 kg (división entre cero).'
    formulaCostoUnitario = 'Costo unitario = no calculable (salida vendible = 0 kg)'
    formulaMargen = 'Margen = no calculable (salida vendible = 0 kg)'
  } else if (
    transformacion.costoEtapaCop === null ||
    transformacion.costoEtapaCop === undefined
  ) {
    calculable = false
    costoUnitarioCop = null
    margenPorcentaje = null
    motivoNoCalculable = 'No se registraron costos para esta etapa de transformación.'
    formulaCostoUnitario = 'Costo unitario = no calculable (costo de etapa no registrado)'
    formulaMargen = 'Margen = no calculable (costo de etapa no registrado)'
  } else {
    costoUnitarioCop = redondear(
      transformacion.costoEtapaCop / transformacion.cantidadSalida,
      2,
    )
    formulaCostoUnitario = `Costo unitario = costo total de la etapa ÷ kg de salida vendible = ${formatearNumero(
      transformacion.costoEtapaCop,
      3,
    )} ÷ ${formatearNumero(transformacion.cantidadSalida, 3)} = ${formatearNumero(
      costoUnitarioCop,
      3,
    )} COP/kg`

    if (precioEfectivo === null) {
      calculable = true
      margenPorcentaje = null
      motivoNoCalculable = null
      formulaMargen = 'Margen = no calculable (precio de venta no especificado)'
    } else if (precioEfectivo === 0) {
      calculable = false
      margenPorcentaje = null
      motivoNoCalculable =
        'No se puede calcular el margen: el precio de venta es 0 COP/kg (división entre cero).'
      formulaMargen =
        'Margen = no calculable (precio de venta = 0 COP/kg, división entre cero)'
    } else {
      margenPorcentaje = redondear(
        ((precioEfectivo - costoUnitarioCop) / precioEfectivo) * 100,
        2,
      )
      calculable = true
      motivoNoCalculable = null
      const margenStr = new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(margenPorcentaje)
      formulaMargen = `Margen = (precio − costo unitario) ÷ precio × 100 = (${formatearNumero(
        precioEfectivo,
        3,
      )} − ${formatearNumero(costoUnitarioCop, 3)}) ÷ ${formatearNumero(
        precioEfectivo,
        3,
      )} × 100 = ${margenStr} %`
    }
  }

  return respuesta(200, {
    transformacionId: transformacion.id,
    loteSalidaCodigo: transformacion.loteSalidaCodigo ?? null,
    costoEtapaCop: transformacion.costoEtapaCop ?? null,
    cantidadSalidaKg: transformacion.cantidadSalida,
    costoUnitarioCop,
    precioVentaCop: precioEfectivo,
    margenPorcentaje,
    esSimulacion,
    calculable,
    motivoNoCalculable,
    formulas: {
      costoUnitario: formulaCostoUnitario,
      margen: formulaMargen,
    },
    costosIncluidos: transformacion.detalleCostosIncluidos ?? null,
    supuestos,
  })
}

function escaparCampoCsv(valor) {
  if (valor === null || valor === undefined) return ''
  const s = String(valor)
  if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function formatearKgCsv(valor) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return ''
  const r = redondear(valor, 3)
  return String(r).replace('.', ',')
}

function formatear2DecimalesCsv(valor) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return ''
  const r = redondear(valor, 2)
  return r.toFixed(2).replace('.', ',')
}

function manejarExportarCsv({ consulta }) {
  const origenFiltro = texto(consulta?.origen).toLocaleLowerCase('es-CO')
  const estadoFiltro = texto(consulta?.estado)

  const lotesFiltrados = lotes
    .filter((l) => !origenFiltro || l.origenMunicipio.toLocaleLowerCase('es-CO') === origenFiltro)
    .filter((l) => !estadoFiltro || l.estado === estadoFiltro)
    .sort((a, b) => a.codigoLote.localeCompare(b.codigoLote))

  const BOM = '\uFEFF'
  const cabecera =
    'codigo_lote;tipo_lote;producto;municipio_origen;finca;cantidad_recibida_kg;cantidad_consumida_kg;cantidad_disponible_kg;estado;costo_etapa_cop;costo_unitario_cop;precio_venta_cop;margen_porcentaje'

  const filas = lotesFiltrados.map((lote) => {
    const productor = productores.find((p) => p.id === lote.productorId)
    const finca = productor?.nombreFinca ?? ''

    let costoEtapa = null
    let costoUnitario = null
    let precioVenta = null
    let margen = null

    if (lote.tipoLote === 'DERIVADO') {
      const t = transformaciones.find((item) => item.loteSalidaCodigo === lote.codigoLote)
      if (t) {
        costoEtapa = t.costoEtapaCop ?? null
        costoUnitario = t.costoUnitarioCop ?? null
        precioVenta = t.precioVentaEstimadoCop ?? null
        margen = t.margenPorcentaje ?? null
      }
    }

    return [
      escaparCampoCsv(lote.codigoLote),
      escaparCampoCsv(lote.tipoLote),
      escaparCampoCsv(lote.producto),
      escaparCampoCsv(lote.origenMunicipio),
      escaparCampoCsv(finca),
      formatearKgCsv(lote.cantidadRecibida),
      formatearKgCsv(lote.cantidadConsumida),
      formatearKgCsv(lote.cantidadDisponible),
      escaparCampoCsv(lote.estado),
      formatear2DecimalesCsv(costoEtapa),
      formatear2DecimalesCsv(costoUnitario),
      formatear2DecimalesCsv(precioVenta),
      formatear2DecimalesCsv(margen),
    ].join(';')
  })

  const textoCsv = BOM + [cabecera, ...filas].join('\r\n') + '\r\n'

  const iso = isoBogota()
  const anio = iso.slice(0, 4)
  const mes = iso.slice(5, 7)
  const dia = iso.slice(8, 10)
  const hora = iso.slice(11, 13)
  const min = iso.slice(14, 16)
  const nombreArchivo = `lotes_${anio}${mes}${dia}_${hora}${min}.csv`

  return {
    status: 200,
    cuerpo: new Blob([textoCsv], { type: 'text/csv;charset=utf-8' }),
    nombreArchivo,
  }
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
  { metodo: 'POST', patron: /^\/transformaciones$/, roles: AMBOS_ROLES, manejador: manejarCrearTransformacion },
  { metodo: 'GET', patron: /^\/transformaciones$/, roles: AMBOS_ROLES, manejador: manejarListaTransformaciones },

  {
    metodo: 'PATCH',
    patron: /^\/lotes\/([^/]+)\/estado$/,
    roles: SOLO_ADMINISTRADOR,
    mensajeAccesoDenegado: 'Solo el Administrador puede liberar o bloquear lotes.',
  },
  { metodo: 'GET', patron: /^\/lotes\/([^/]+)\/recall$/, roles: SOLO_ADMINISTRADOR },
  {
    metodo: 'GET',
    patron: /^\/transformaciones\/([^/]+)\/balance$/,
    roles: SOLO_ADMINISTRADOR,
    manejador: manejarBalance,
  },
  { metodo: 'GET', patron: /^\/alertas$/, roles: SOLO_ADMINISTRADOR, manejador: manejarListaAlertas },
  { metodo: 'GET', patron: /^\/auditoria$/, roles: SOLO_ADMINISTRADOR },
  {
    metodo: 'GET',
    patron: /^\/reportes\/exportar-csv$/,
    roles: SOLO_ADMINISTRADOR,
    manejador: manejarExportarCsv,
  },
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
