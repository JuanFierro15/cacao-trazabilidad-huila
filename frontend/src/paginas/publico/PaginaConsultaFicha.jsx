import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

export function EncabezadoPublico() {
  const navigate = useNavigate()
  const location = useLocation()

  function manejarVolver() {
    if (typeof window !== 'undefined' && window.history.state?.idx > 0) {
      navigate(-1)
      return
    }
    if (location.pathname !== '/ficha') {
      navigate('/ficha')
      return
    }
    navigate('/')
  }

  return (
    <header className="border-b border-mazorca/25 bg-cacao px-4 py-3.5 text-crema shadow-sm">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={manejarVolver}
          className={`group inline-flex items-center gap-2 rounded-lg border border-crema/25 bg-crema/10 px-3.5 py-2 text-xs font-semibold text-crema transition-colors duration-200 hover:border-mazorca hover:bg-crema/20 ${FOCO}`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-mazorca transition-transform duration-200 group-hover:-translate-x-0.5"
          >
            <path d="M12.5 15 7.5 10l5-5" />
          </svg>
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="font-display text-lg font-bold leading-tight text-crema">
              Cacao con historia
            </p>
            <p className="text-xs text-crema/80">Pasaporte digital del producto</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-mazorca/40 bg-crema p-1 shadow-xs">
            <img
              src="/assets/logo-emblema-192.webp"
              alt="Asoprocacao"
              width={32}
              height={32}
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export function PiePublico() {
  return (
    <footer className="mt-auto border-t border-cacao/10 bg-white/40 px-4 py-6 text-center text-xs text-cacao/70">
      <div className="mx-auto max-w-xl">
        <p>Información pública del lote. Asoprocacao, Campoalegre (Huila). Datos de demostración.</p>
      </div>
    </footer>
  )
}

export function FormularioConsultaFicha({ valorInicial = '' }) {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState(valorInicial)
  const [errorValidacion, setErrorValidacion] = useState(null)

  function manejarEnvio(evento) {
    evento.preventDefault()
    const limpio = codigo.trim().toUpperCase()
    if (!limpio) {
      setErrorValidacion('Escriba el código impreso en la etiqueta, por ejemplo CAC001-T1.')
      return
    }
    setErrorValidacion(null)
    navigate(`/ficha/${encodeURIComponent(limpio)}`)
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="space-y-3">
      <div>
        <label htmlFor="campo-codigo-producto" className="block text-sm font-semibold text-cacao">
          Código del producto
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <input
            id="campo-codigo-producto"
            name="codigo"
            type="text"
            placeholder="Ej. CAC001-T1"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value)
              if (errorValidacion) setErrorValidacion(null)
            }}
            aria-invalid={errorValidacion ? true : undefined}
            aria-describedby={errorValidacion ? 'error-codigo-producto' : undefined}
            className={`block w-full rounded-md border border-cacao/30 bg-crema/75 px-3 py-2 text-base text-cacao shadow-inner transition-colors focus:bg-crema/95 ${FOCO} aria-invalid:border-red-700`}
          />
          <button
            type="submit"
            className={`rounded-md bg-cacao px-5 py-2 font-semibold text-crema shadow-xs transition-colors hover:bg-cacao/90 sm:shrink-0 ${FOCO}`}
          >
            Ver ficha
          </button>
        </div>
        {errorValidacion && (
          <p id="error-codigo-producto" role="alert" className="mt-1 text-sm text-red-800">
            {errorValidacion}
          </p>
        )}
      </div>
    </form>
  )
}

export function PaginaConsultaFicha() {
  return (
    <div className="flex min-h-screen flex-col bg-crema text-cacao">
      <EncabezadoPublico />

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <div className="space-y-4 rounded-xl border border-cacao/15 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-cacao">Consulte el origen de su cacao</h1>
          <p className="text-sm text-cacao/80">
            Ingrese el código de su producto para conocer su procedencia, variedad y recorrido de
            transformación.
          </p>

          <FormularioConsultaFicha />
        </div>
      </main>

      <PiePublico />
    </div>
  )
}
