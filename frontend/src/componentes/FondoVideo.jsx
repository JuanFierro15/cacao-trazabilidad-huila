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
    <div className={`${posicion} overflow-hidden ${className}`.trim()}>
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
        className="h-full w-full object-cover"
        style={mascara ? ESTILO_MASCARA : undefined}
      />
      <button
        type="button"
        aria-pressed={pausado}
        onClick={alternarReproduccion}
        className={`absolute right-3 bottom-3 z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-crema/60 bg-cacao/85 px-3 py-2 text-xs font-semibold text-crema shadow-sm transition-colors hover:bg-cacao ${FOCO}`}
      >
        {pausado ? 'Reproducir video' : 'Pausar video'}
      </button>
    </div>
  )
}

export default FondoVideo
