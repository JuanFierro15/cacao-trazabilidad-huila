export function MensajeError({ error, titulo }) {
  if (!error) return null
  const errores = Array.isArray(error.errores) ? error.errores : []
  const mensaje = error.mensaje ?? error.message ?? 'Ocurrió un error inesperado. Intente de nuevo.'

  return (
    <div role="alert" className="rounded-md border border-red-700 bg-red-50 p-3 text-sm text-red-800">
      {titulo && <p className="font-semibold">{titulo}</p>}
      <p>{mensaje}</p>
      {errores.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {errores.map((item, indice) => (
            <li key={`${item.campo}-${indice}`}>
              {item.campo}: {item.mensaje}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
