import { useCallback, useEffect, useRef, useState } from 'react'

// Las dependencias deben ser serializables (textos, números, objetos de filtros):
// se comparan por su JSON para poder declararlas de forma estática en el efecto.
export function useConsultaApi(funcion, dependencias = []) {
  const funcionRef = useRef(funcion)
  const [version, setVersion] = useState(0)
  const [resultado, setResultado] = useState({ solicitud: null, datos: null, error: null })

  const claveDependencias = JSON.stringify(dependencias)
  const solicitud = `${claveDependencias}#${version}`

  // Se usa siempre la función más reciente sin que su identidad dispare consultas nuevas.
  useEffect(() => {
    funcionRef.current = funcion
  })

  useEffect(() => {
    // Evita que una respuesta lenta de una ejecución anterior pise a la más reciente.
    let cancelada = false

    Promise.resolve()
      .then(() => funcionRef.current())
      .then(
        (datos) => {
          if (!cancelada) setResultado({ solicitud, datos, error: null })
        },
        (error) => {
          if (!cancelada) setResultado((previo) => ({ solicitud, datos: previo.datos, error }))
        },
      )

    return () => {
      cancelada = true
    }
  }, [solicitud])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  // El estado de carga se deriva: hay carga mientras la última respuesta no
  // corresponde a la solicitud vigente.
  const cargando = resultado.solicitud !== solicitud
  return {
    datos: resultado.datos,
    cargando,
    error: cargando ? null : resultado.error,
    recargar,
  }
}
