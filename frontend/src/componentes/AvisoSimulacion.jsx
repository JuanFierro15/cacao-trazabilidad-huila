import { USAR_SIMULACIONES } from '../api/cliente.js'

export function AvisoSimulacion() {
  if (!USAR_SIMULACIONES) return null
  return (
    <div role="status" className="bg-mazorca px-4 py-2 text-center text-sm font-semibold text-cacao">
      Modo simulación: los datos son de prueba y no vienen del servidor.
    </div>
  )
}
