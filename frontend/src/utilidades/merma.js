// Corte fijo de la interfaz para el color verde del semáforo; el umbral rojo viene de la API.
export const LIMITE_VERDE = 10

export function calcularMerma(entrada, salida) {
  if (
    typeof entrada !== 'number' ||
    !Number.isFinite(entrada) ||
    entrada <= 0 ||
    typeof salida !== 'number' ||
    !Number.isFinite(salida) ||
    salida < 0
  ) {
    return null
  }
  return Math.round(((entrada - salida) / entrada) * 10000) / 100
}

export function calcularRendimiento(entrada, salida) {
  if (
    typeof entrada !== 'number' ||
    !Number.isFinite(entrada) ||
    entrada <= 0 ||
    typeof salida !== 'number' ||
    !Number.isFinite(salida) ||
    salida < 0
  ) {
    return null
  }
  return Math.round((salida / entrada) * 10000) / 100
}

export function nivelMerma(merma, umbral) {
  if (typeof merma !== 'number' || !Number.isFinite(merma)) return null
  if (merma < 0) return 'insumos'
  if (merma < LIMITE_VERDE) return 'verde'
  if (merma <= umbral) return 'ambar'
  return 'rojo'
}
