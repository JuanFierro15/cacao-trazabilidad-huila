import { Link } from 'react-router'
import { AvisoSimulacion } from '../../componentes/AvisoSimulacion.jsx'
import { FondoVideo } from '../../componentes/FondoVideo.jsx'
import { useAlAparecer } from '../../utilidades/useAlAparecer.js'
import { FormularioConsultaFicha } from '../publico/PaginaConsultaFicha.jsx'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

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

  return (
    <div className="flex min-h-screen flex-col bg-crema text-cacao">
      <AvisoSimulacion />

      <header className="border-b border-cacao/15 bg-crema">
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
            className={`shrink-0 rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema transition-colors hover:bg-cacao/90 ${FOCO}`}
          >
            Ingresar
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Héroe */}
        <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10">
            <div className="space-y-6 md:col-span-7">
              <h1 className="font-display text-5xl font-bold leading-none tracking-tight text-cacao md:text-7xl">
                Del cultivo al comprador, cada grano con su historia
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-cacao/85 md:text-lg">
                Asoprocacao registra el acopio, la transformación y la venta de su cacao en una sola
                plataforma. Cada lote sale con una ficha pública y un código QR que muestran su
                origen, su recorrido y si está disponible para la venta.
              </p>

              <div
                id="consulta"
                className="scroll-mt-24 space-y-3 rounded-xl border border-cacao/20 bg-arena/50 p-5"
              >
                <p className="text-sm font-medium text-cacao">
                  ¿Compró cacao de Asoprocacao? Escriba el código impreso en el empaque o escanee el
                  QR.
                </p>
                <FormularioConsultaFicha />
              </div>

              <div>
                <Link
                  to="/login"
                  className={`inline-block rounded px-1 py-1 text-sm font-semibold text-cacao underline decoration-mazorca decoration-2 underline-offset-4 transition-colors hover:text-mazorca-oscuro ${FOCO}`}
                >
                  Ingresar al sistema
                </Link>
              </div>
            </div>

            <div className="md:col-span-5">
              <FondoVideo
                src="/assets/hero-productores.mp4"
                poster="/assets/hero-productores-poster.jpg"
                mascara={true}
                className="aspect-video w-full rounded-2xl bg-arena"
              />
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
                  className={`inline-block rounded-md bg-cacao px-5 py-2.5 text-sm font-semibold text-crema transition-colors hover:bg-cacao/90 ${FOCO}`}
                >
                  Ingresar al sistema
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
