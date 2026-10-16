const CHIPS = [
  'Impurezas y pasilla superiores a lo normal',
  'Granos partidos o dañados',
  'Humedad superior a la esperada',
  'Fermentación irregular',
  'Pérdida por manipulación',
  'Adición de insumos',
]

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

export function ChipsIncidencia({ valor, onCambiar, onInsumos }) {
  const textoActual = typeof valor === 'string' ? valor : ''
  const partes = textoActual
    ? textoActual
        .split(/\.\s*/)
        .map((p) => p.trim())
        .filter(Boolean)
    : []

  const alternarChip = (chip) => {
    const activo = partes.includes(chip)
    let nuevasPartes
    if (activo) {
      nuevasPartes = partes.filter((p) => p !== chip)
      if (chip === 'Adición de insumos' && onInsumos) {
        onInsumos(false)
      }
    } else {
      nuevasPartes = [...partes, chip]
      if (chip === 'Adición de insumos' && onInsumos) {
        onInsumos(true)
      }
    }
    onCambiar(nuevasPartes.join('. '))
  }

  return (
    <div
      role="group"
      aria-label="Incidencias frecuentes"
      className="flex flex-wrap items-center gap-2"
    >
      {CHIPS.map((chip) => {
        const activo = partes.includes(chip)
        return (
          <button
            key={chip}
            type="button"
            aria-pressed={activo}
            onClick={() => alternarChip(chip)}
            className={`inline-flex min-h-[44px] items-center rounded-full px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm ${
              activo
                ? 'border border-cacao bg-cacao text-crema'
                : 'border border-cacao/25 bg-cacao/10 text-cacao hover:bg-cacao/20'
            } ${FOCO}`}
          >
            {activo ? `✓ ${chip}` : chip}
          </button>
        )
      })}
    </div>
  )
}
