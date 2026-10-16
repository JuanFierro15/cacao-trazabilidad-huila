import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AvisoSimulacion } from '../../componentes/AvisoSimulacion.jsx'
import { FondoVideo } from '../../componentes/FondoVideo.jsx'
import { useAlAparecer } from '../../utilidades/useAlAparecer.js'
import { FormularioConsultaFicha } from '../publico/PaginaConsultaFicha.jsx'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

function IconoCacao({ className = 'h-4 w-4' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 4.2c0-1.2.8-2 2.2-2.2" />
      <path d="M12 4.2C7.8 4.2 5 8.1 5 12.6c0 4.3 3.2 7.8 7 9.2 3.8-1.4 7-4.9 7-9.2 0-4.5-2.8-8.4-7-8.4Z" />
      <path d="M9.2 5.3c-1.4 2.3-1.9 4.8-1.9 7.3 0 2.6.6 5.1 2.2 7.3" />
      <path d="M14.8 5.3c1.4 2.3 1.9 4.8 1.9 7.3 0 2.6-.6 5.1-2.2 7.3" />
      <path d="M12 4.4v17.2" />
    </svg>
  )
}

const ANCLAS_NAVEGACION = [
  { href: '#recorrido', texto: 'Cómo funciona' },
  { href: '#consulta', texto: 'Consultar un lote' },
  { href: '#asociacion', texto: 'Para la asociación' },
]

const PASOS_RECORRIDO = [
  {
    titulo: 'Finca',
    descripcion:
      'Cada productor tiene su finca, municipio, variedad y una cuota anual según sus hectáreas.',
  },
  {
    titulo: 'Acopio',
    descripcion:
      'El operador registra peso, humedad y tipo de grano. El sistema asigna un código único y alerta si la entrega supera la cuota de la finca.',
  },
  {
    titulo: 'Transformación',
    descripcion:
      'En cada etapa, del beneficio al empaque, se pesa la entrada y la salida. La merma se ve mientras se registra y no se puede consumir más de lo disponible.',
  },
  {
    titulo: 'Control',
    descripcion:
      'La administración revisa alertas, costos y márgenes, y libera o bloquea cada lote. Al bloquear, también retiene todo lo que salió de él.',
  },
  {
    titulo: 'Ficha pública',
    descripcion:
      'El comprador escanea el QR y ve el origen, el recorrido y el estado, sin costos ni datos personales.',
  },
]

const PUNTOS_ASOCIACION = [
  {
    titulo: 'Alerta de cuota por finca:',
    detalle:
      'una entrega que supera lo que la finca puede producir se detecta en el acopio, no meses después.',
  },
  {
    titulo: 'Merma en vivo y causa en un toque:',
    detalle:
      'el operador ve el porcentaje mientras pesa y registra el motivo con un botón.',
  },
  {
    titulo: 'Retiro inmediato:',
    detalle:
      'ante un reclamo, un lote y todo lo que salió de él quedan bloqueados en un solo paso, con el reporte de los kilos afectados.',
  },
]

export function PaginaInicio() {
  const [refTraza, trazaVisible] = useAlAparecer()
  const [ocultarBarra, setOcultarBarra] = useState(false)
  const [barraConSombra, setBarraConSombra] = useState(false)
  const ultimoScrollYRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    ultimoScrollYRef.current = window.scrollY

    function manejarScroll() {
      const actualY = window.scrollY
      const diferencia = actualY - ultimoScrollYRef.current

      setBarraConSombra(actualY > 16)

      if (actualY <= 64) {
        setOcultarBarra(false)
      } else if (diferencia > 6) {
        setOcultarBarra(true)
      } else if (diferencia < -6) {
        setOcultarBarra(false)
      }

      ultimoScrollYRef.current = actualY
    }

    window.addEventListener('scroll', manejarScroll, { passive: true })
    return () => window.removeEventListener('scroll', manejarScroll)
  }, [])

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-clip bg-crema text-cacao [overflow-anchor:none]">
      <AvisoSimulacion />

      <header
        onFocusCapture={() => setOcultarBarra(false)}
        className={`sticky top-0 z-40 border-b border-cacao/15 bg-crema/95 backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${
          ocultarBarra ? '-translate-y-full' : 'translate-y-0'
        } ${barraConSombra && !ocultarBarra ? 'shadow-md' : ''}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo-emblema-96.webp"
              alt=""
              width={124}
              height={96}
              className="h-10 w-auto shrink-0"
            />
            <div>
              <p className="font-display text-xl font-bold leading-tight text-cacao">
                Cacao con historia
              </p>
              <p className="text-xs text-cacao/75">de Asoprocacao, Campoalegre (Huila)</p>
            </div>
          </div>

          <nav aria-label="Secciones de la página" className="hidden items-center gap-6 md:flex">
            {ANCLAS_NAVEGACION.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded px-1 py-1 text-sm font-medium text-cacao transition-colors hover:text-mazorca-oscuro hover:underline decoration-mazorca underline-offset-4 ${FOCO}`}
              >
                {item.texto}
              </a>
            ))}
          </nav>

          <Link
            to="/login"
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg border border-mazorca/40 bg-cacao px-4 py-2 text-sm font-semibold text-crema shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-mazorca hover:bg-cacao/95 hover:shadow-md active:translate-y-0 ${FOCO}`}
          >
            <IconoCacao className="h-4 w-4 text-mazorca" />
            Ingresar
          </Link>
        </div>
      </header>

      <main className="min-w-0 flex-1 overflow-x-clip">
        {/* Héroe */}
        <section className="relative isolate w-full max-w-full overflow-hidden bg-cacao text-crema">
          <FondoVideo
            src="/assets/hero-productores.mp4"
            poster="/assets/hero-productores-poster.jpg"
            className="inset-0 absolute h-full w-full"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-to-r/oklab from-cacao/90 via-cacao/80 to-cacao/50"
          />

          <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 pb-18 md:py-24">
            <div className="max-w-2xl space-y-6">
              <h1 className="font-display text-5xl font-bold leading-none tracking-tight text-crema md:text-7xl">
                Del cultivo al comprador, cada grano con su historia
              </h1>

              <p className="text-base leading-relaxed text-crema/90 md:text-lg">
                Asoprocacao registra el acopio, la transformación y la venta de su cacao en una sola
                plataforma. Cada lote sale con una ficha pública y un código QR que muestran su
                origen, su recorrido y si está disponible para la venta.
              </p>

              <div
                id="consulta"
                className="scroll-mt-24 space-y-3 rounded-2xl border border-mazorca/30 bg-arena/80 p-5 text-cacao shadow-md backdrop-blur-sm"
              >
                <p className="text-sm font-medium text-cacao">
                  ¿Compró cacao de Asoprocacao? Escriba el código impreso en el empaque o escanee el
                  QR.
                </p>
                <FormularioConsultaFicha />
              </div>

              <div className="pt-1">
                <Link
                  to="/login"
                  className={`group inline-flex items-center gap-2.5 rounded-xl border border-crema/35 bg-mazorca px-5 py-3 text-sm font-bold text-cacao shadow-[0_1px_0_0_rgba(255,253,249,0.4)_inset,0_8px_20px_-4px_rgba(20,10,4,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:border-crema/70 hover:bg-arena hover:shadow-[0_1px_0_0_rgba(255,253,249,0.6)_inset,0_12px_24px_-4px_rgba(20,10,4,0.7)] active:translate-y-0 ${FOCO}`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-cacao/15 text-cacao transition-colors group-hover:bg-cacao group-hover:text-crema"
                  >
                    <IconoCacao className="h-4 w-4" />
                  </span>
                  <span>Ingresar al sistema</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* El recorrido del grano */}
        <section
          id="recorrido"
          aria-labelledby="titulo-recorrido"
          className="scroll-mt-20 border-y border-cacao/15 bg-arena py-12 md:py-16"
        >
          <div className="mx-auto max-w-6xl px-4">
            <h2
              id="titulo-recorrido"
              className="font-display text-3xl font-bold text-cacao md:text-4xl"
            >
              El recorrido del grano
            </h2>

            <ol
              ref={refTraza}
              className={`traza traza-horizontal mt-8 space-y-6 lg:space-y-0 ${trazaVisible ? 'visible' : ''}`}
            >
              {PASOS_RECORRIDO.map((paso, indice) => (
                <li key={paso.titulo} style={{ '--i': indice }}>
                  <h3 className="font-display text-2xl font-bold text-cacao">{paso.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-cacao/85">{paso.descripcion}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Para la asociación */}
        <section
          id="asociacion"
          aria-labelledby="titulo-asociacion"
          className="scroll-mt-20 mx-auto max-w-6xl px-4 py-12 md:py-16"
        >
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-6">
              <img
                src="/assets/productor-mazorca-abierta-800.webp"
                srcSet="/assets/productor-mazorca-abierta-800.webp 800w, /assets/productor-mazorca-abierta-1600.webp 1600w"
                sizes="(min-width: 768px) 50vw, 100vw"
                width={800}
                height={447}
                loading="lazy"
                alt="Productor sosteniendo una mazorca de cacao abierta"
                className="h-auto w-full rounded-2xl border border-cacao/15 object-cover"
              />
            </div>

            <div className="space-y-6 md:col-span-6">
              <h2
                id="titulo-asociacion"
                className="font-display text-3xl font-bold text-cacao md:text-4xl"
              >
                Lo que cambia para la asociación
              </h2>

              <ul className="divide-y divide-cacao/15">
                {PUNTOS_ASOCIACION.map((punto) => (
                  <li key={punto.titulo} className="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-cacao bg-mazorca"
                    />
                    <p className="text-base leading-relaxed text-cacao/90">
                      <strong className="font-semibold text-cacao">{punto.titulo}</strong>{' '}
                      {punto.detalle}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Link
                  to="/login"
                  className={`group inline-flex items-center gap-2.5 rounded-xl border border-mazorca/40 bg-cacao px-5 py-3 text-sm font-semibold text-crema shadow-[0_1px_0_0_rgba(255,253,249,0.2)_inset,0_6px_16px_-4px_rgba(58,31,13,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-mazorca hover:bg-cacao/95 hover:shadow-lg active:translate-y-0 ${FOCO}`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-mazorca/20 text-mazorca transition-colors group-hover:bg-mazorca group-hover:text-cacao"
                  >
                    <IconoCacao className="h-4 w-4" />
                  </span>
                  <span>Ingresar al sistema</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-cacao text-crema">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-10 sm:flex-row sm:items-center">
          <div className="shrink-0 rounded-2xl bg-crema p-3">
            <img
              src="/assets/logo-completo-480.webp"
              srcSet="/assets/logo-completo-480.webp 480w, /assets/logo-completo-960.webp 960w"
              sizes="112px"
              width={480}
              height={495}
              loading="lazy"
              alt="Asoprocacao, Campoalegre, Huila"
              className="h-28 w-auto"
            />
          </div>

          <div className="space-y-2 text-sm text-crema/90">
            <p>
              Asoprocacao es un cliente simulado del II Hackathon de Programación (USCO, Semillero
              DEVURITY, 2026). Los datos son sintéticos y las fotografías y los videos son
              ilustraciones generadas con IA.
            </p>
            <p className="font-semibold text-crema">
              Equipo KGB, Ingeniería de Software, Universidad Surcolombiana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PaginaInicio
