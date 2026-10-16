export const HUMEDAD_MAX = 7.0
export const HUMEDAD_MIN = 6.5
export const ESCALA_HUMEDAD_MAX = 12.0

// Evalúa el contenido de humedad según la referencia técnica de grano seco.
export function evaluarHumedad(humedad, tipoGrano, kg = null) {
  if (tipoGrano !== 'SECO') return null
  if (typeof humedad !== 'number' || !Number.isFinite(humedad)) return null

  const posicionMarcador = Math.min(100, Math.max(0, (humedad / ESCALA_HUMEDAD_MAX) * 100))

  let nivel = 'cumple'
  let aguaExcedenteKg = null

  if (humedad > HUMEDAD_MAX) {
    nivel = 'exceso'
    const kgNumero = typeof kg === 'number' && Number.isFinite(kg) ? kg : null
    if (kgNumero !== null && kgNumero > 0) {
      aguaExcedenteKg = (kgNumero * (humedad - HUMEDAD_MAX)) / 100
    }
  } else if (humedad < HUMEDAD_MIN) {
    nivel = 'baja'
  }

  return {
    nivel,
    humedad,
    aguaExcedenteKg,
    posicionMarcador,
    humedadMin: HUMEDAD_MIN,
    humedadMax: HUMEDAD_MAX,
  }
}
