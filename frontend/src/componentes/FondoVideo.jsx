import { useEffect, useRef, useState } from 'react'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

const MASCARA_RADIAL = 'radial-gradient(ellipse 75% 75% at 50% 50%, #000 55%, transparent 100%)'

const ESTILO_MASCARA = {
  maskImage: MASCARA_RADIAL,
  WebkitMaskImage: MASCARA_RADIAL,
}

function prefiereMovimientoReducido() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function FondoVideo({ src, poster, className = '', mascara = false }) {
  const videoRef = useRef(null)
  const [movimientoReducido, setMovimientoReducido] = useState(prefiereMovimientoReducido)
  const [pausado, setPausado] = useState(prefiereMovimientoReducido)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const video = videoRef.current

    if (consulta.matches && video) {
      video.autoplay = false
      video.pause()
    }

    function manejarCambio(evento) {
      const reducir = evento.matches
      setMovimientoReducido(reducir)
      const elementoVideo = videoRef.current
      if (!elementoVideo) return
      if (reducir) {
        elementoVideo.autoplay = false
        elementoVideo.pause()
        elementoVideo.load()
        setPausado(true)
      } else {
        const promesa = elementoVideo.play()
        if (promesa && typeof promesa.then === 'function') {
          promesa.then(() => setPausado(false)).catch(() => setPausado(true))
        } else {
          setPausado(false)
        }
      }
    }

    consulta.addEventListener('change', manejarCambio)
    return () => consulta.removeEventListener('change', manejarCambio)
  }, [src])

  function alternarReproduccion() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      const promesa = video.play()
      if (promesa && typeof promesa.then === 'function') {
        promesa.then(() => setPausado(false)).catch(() => setPausado(true))
      } else {
        setPausado(false)
      }
    } else {
      video.pause()
      setPausado(true)
    }
  }

  const posicion = /\b(absolute|fixed|sticky|relative)\b/.test(className) ? '' : 'relative'

  return (
    <div className={`${posicion} max-w-full overflow-hidden ${className}`.trim()}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={!movimientoReducido}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onPlay={() => setPausado(false)}
        onPause={() => setPausado(true)}
        className="block h-full w-full max-w-full object-cover object-center"
        style={mascara ? ESTILO_MASCARA : undefined}
      />
      <button
        type="button"
        aria-pressed={pausado}
        onClick={alternarReproduccion}
        className={`absolute right-4 bottom-4 z-30 inline-flex min-h-10 items-center justify-center rounded-lg border border-crema/60 bg-cacao/90 px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-crema shadow-md transition-colors hover:bg-cacao ${FOCO}`}
      >
        {pausado ? 'Reproducir video' : 'Pausar video'}
      </button>
    </div>
  )
}

export default FondoVideo
