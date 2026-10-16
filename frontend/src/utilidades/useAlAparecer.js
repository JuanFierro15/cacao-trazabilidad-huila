import { useEffect, useRef, useState } from 'react'

function soportaObservadorInterseccion() {
  return typeof window !== 'undefined' && typeof window.IntersectionObserver === 'function'
}

// Activa una marca booleana la primera vez que el elemento entra en pantalla y
// desconecta el observador enseguida para no repetir la animación.
export function useAlAparecer(umbral = 0.2) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => !soportaObservadorInterseccion())

  useEffect(() => {
    if (visible || !soportaObservadorInterseccion()) return undefined
    const elemento = ref.current
    if (!elemento) return undefined

    const observador = new window.IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: umbral },
    )

    observador.observe(elemento)
    return () => observador.disconnect()
  }, [visible, umbral])

  return [ref, visible]
}

export default useAlAparecer
