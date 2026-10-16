const LOCALE = 'es-CO'
const ZONA_HORARIA = 'America/Bogota'
const SIN_VALOR = '—'

function sinValor(valor) {
  return valor === null || valor === undefined
}

export function formatearNumero(valor, decimales = 0) {
  if (sinValor(valor)) return SIN_VALOR
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  }).format(valor)
}

export function formatearKg(valor) {
  if (sinValor(valor)) return SIN_VALOR
  return `${formatearNumero(valor, 3)} kg`
}

export function formatearHectareas(valor) {
  if (sinValor(valor)) return SIN_VALOR
  const numero = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
  return `${numero} ha`
}

export function formatearPorcentaje(valor) {
  if (sinValor(valor)) return SIN_VALOR
  const numero = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
  return `${numero} %`
}

export function formatearCop(valor) {
  if (sinValor(valor)) return SIN_VALOR
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor)
}

// Se separa el texto en vez de usar new Date('YYYY-MM-DD'): esa forma se
// interpreta en UTC y en Bogotá (UTC-5) mostraría el día anterior.
export function formatearFecha(fecha) {
  if (typeof fecha !== 'string' || fecha === '') return SIN_VALOR
  const [anio, mes, dia] = fecha.slice(0, 10).split('-')
  if (!anio || !mes || !dia) return fecha
  return `${dia}/${mes}/${anio}`
}

export function formatearFechaHora(isoConDesfase) {
  if (typeof isoConDesfase !== 'string' || isoConDesfase === '') return SIN_VALOR
  const fecha = new Date(isoConDesfase)
  if (Number.isNaN(fecha.getTime())) return isoConDesfase
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: ZONA_HORARIA,
  }).format(fecha)
}

export function leerDecimal(texto) {
  if (texto === null || texto === undefined) return null
  if (typeof texto !== 'string') {
    if (typeof texto === 'number' && Number.isFinite(texto)) return texto
    return NaN
  }
  const limpio = texto.trim()
  if (limpio === '') return null
  const normalizado = limpio.replace(',', '.')
  if (/^-?\d+(\.\d+)?$/.test(normalizado)) {
    return Number(normalizado)
  }
  return NaN
}

export function leerMonto(texto) {
  if (texto === null || texto === undefined) return null
  if (typeof texto !== 'string') {
    if (typeof texto === 'number' && Number.isFinite(texto)) return texto
    return NaN
  }
  let limpio = texto.replace(/[\s$]/g, '')
  if (limpio === '') return null

  if (limpio.includes(',')) {
    limpio = limpio.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) {
    limpio = limpio.replace(/\./g, '')
  }

  if (/^-?\d+(\.\d+)?$/.test(limpio)) {
    return Number(limpio)
  }
  return NaN
}

export function fechaHoyBogota() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(new Date())
}

const ETIQUETAS_ESTADO = {
  PENDIENTE: 'Pendiente',
  LIBERADO: 'Liberado',
  BLOQUEADO: 'Bloqueado',
}

export function etiquetaEstado(estado) {
  return ETIQUETAS_ESTADO[estado] ?? estado ?? SIN_VALOR
}

const ETIQUETAS_TIPO_GRANO = {
  SECO: 'Seco',
  BABA: 'En baba',
}

export function etiquetaTipoGrano(tipo) {
  return ETIQUETAS_TIPO_GRANO[tipo] ?? tipo ?? SIN_VALOR
}

const ETIQUETAS_TIPO_LOTE = {
  RECEPCION: 'Recepción',
  DERIVADO: 'Derivado',
}

export function etiquetaTipoLote(tipo) {
  return ETIQUETAS_TIPO_LOTE[tipo] ?? tipo ?? SIN_VALOR
}

const ETIQUETAS_TIPO_ALERTA = {
  CUOTA_EXCEDIDA: 'Cuota de plausibilidad excedida',
  MERMA_ALTA: 'Merma alta',
  SOBRECOSTO: 'Sobrecosto',
  REGISTRO_INCOMPLETO: 'Registro incompleto',
}

export function etiquetaTipoAlerta(tipo) {
  return ETIQUETAS_TIPO_ALERTA[tipo] ?? tipo ?? SIN_VALOR
}
