import { useState } from 'react'
import { useNavigate } from 'react-router'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

export function EncabezadoPublico() {
  return (
    <header className="bg-cacao px-4 py-4 text-crema shadow-sm">
      <div className="mx-auto max-w-xl">
        <p className="text-xl font-bold">Cacao con historia</p>
        <p className="text-xs text-crema/80">Pasaporte digital del producto</p>
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
