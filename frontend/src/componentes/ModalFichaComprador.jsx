import { useEffect, useId, useRef, useState } from 'react'
import { obtenerFichaPublica } from '../api/servicios.js'
import { MensajeError } from './MensajeError.jsx'
import { formatearFecha, formatearFechaHora } from '../utilidades/formato.js'
import { useConsultaApi } from '../utilidades/useConsultaApi.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'
const CODIGOS_EJEMPLO = ['CAC001', 'CAC002', 'CAC003']

export function DetalleFichaPublica({ codigoLote }) {
  const {
    datos: ficha,
    cargando,
    error,
    recargar,
  } = useConsultaApi(() => obtenerFichaPublica(codigoLote), [codigoLote])

  if (cargando && !ficha) {
    return (
      <p role="status" className="p-4 text-center text-sm text-cacao/70">
        Cargando información del producto…
      </p>
    )
  }

  if (error && !ficha) {
    if (error.status === 404) {
      return (
        <div className="space-y-2 rounded-xl border border-cacao/15 bg-white p-5 shadow-xs">
          <h3 className="text-lg font-bold text-cacao">Producto no encontrado</h3>
          <p className="text-sm text-cacao/85">
            No encontramos un producto con el código{' '}
            <span className="font-semibold text-cacao">{codigoLote}</span>. Revise el código impreso
            o intente con otro lote.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <MensajeError error={error} titulo="No se pudo consultar el producto" />
        <button
          type="button"
          onClick={recargar}
          className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!ficha) return null

  let estadoClase = 'bg-mazorca text-cacao'
  let tituloEstado = 'Aún no está disponible para la venta'
  let esAlerta = false

  if (ficha.estado === 'BLOQUEADO') {
    estadoClase = 'bg-red-700 text-white'
    tituloEstado = 'Producto retenido: no está disponible para la venta'
    esAlerta = true
  } else if (ficha.disponibleParaVenta) {
    estadoClase = 'bg-origen text-white'
    tituloEstado = 'Disponible para la venta'
  }

  const recorrido = Array.isArray(ficha.recorrido) ? ficha.recorrido : []

  return (
    <div className="space-y-4">
      {cargando && (
        <p role="status" className="text-xs text-cacao/70">
          Actualizando…
        </p>
      )}

      {error && <MensajeError error={error} titulo="Error al actualizar la información" />}

      {/* Bloque de estado destacado */}
      <div
        role={esAlerta ? 'alert' : 'status'}
        className={`sello rounded-lg p-4 shadow-xs ${estadoClase}`}
      >
        <p className="text-base font-bold">{tituloEstado}</p>
        <p className="mt-1 text-sm opacity-95">{ficha.mensajeEstado}</p>
      </div>

      {/* Producto y código */}
      <div className="space-y-4 rounded-lg border border-cacao/20 bg-white p-5 shadow-xs">
        <h3 className="font-display text-2xl font-bold text-cacao">
          {ficha.producto} · Lote {ficha.codigoLote}
        </h3>

        {/* Origen */}
        <section
          aria-labelledby="titulo-origen-publico"
          className="space-y-2 border-t border-cacao/10 pt-3.5"
        >
          <h4
            id="titulo-origen-publico"
            className="text-xs font-bold uppercase tracking-wider text-cacao/75"
          >
            Origen
          </h4>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-cacao/70">Finca</dt>
              <dd className="font-semibold text-cacao">{ficha.origen?.finca || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Municipio</dt>
              <dd className="font-semibold text-cacao">{ficha.origen?.municipio || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Departamento</dt>
              <dd className="font-semibold text-cacao">{ficha.origen?.departamento || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-cacao/70">Variedad de cacao</dt>
              <dd className="font-semibold text-cacao">{ficha.origen?.variedadCacao || '—'}</dd>
            </div>
          </dl>
          <p className="pt-1 text-xs text-cacao/80">
            Recibido en acopio el {formatearFecha(ficha.fechaRecepcionOrigen)}
          </p>
        </section>

        {/* Recorrido */}
        <section
          aria-labelledby="titulo-recorrido-publico"
          className="space-y-2.5 border-t border-cacao/10 pt-3.5"
        >
          <h4
            id="titulo-recorrido-publico"
            className="text-xs font-bold uppercase tracking-wider text-cacao/75"
          >
            Recorrido
          </h4>
          <ol className="traza visible space-y-2.5">
            {recorrido.map((paso, indice) => (
              <li key={paso.orden} className="relative" style={{ '--i': indice }}>
                <p className="text-sm font-semibold text-cacao">{paso.nombre}</p>
                <p className="text-xs text-cacao/70">{formatearFecha(paso.fecha)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Fecha y hora de consulta */}
        <p className="border-t border-cacao/10 pt-3 text-xs text-cacao/70">
          Consultado el {formatearFechaHora(ficha.consultadoEn)}
        </p>
      </div>
    </div>
  )
}

export function ModalFichaComprador({ abierto, codigoInicial = '', onCerrar }) {
  const dialogRef = useRef(null)
  const inputRef = useRef(null)
  const idBase = useId()
  const idTitulo = `${idBase}-titulo`

  useEffect(() => {
    const dialogo = dialogRef.current
    if (!dialogo) return
    if (abierto) {
      if (!dialogo.open) {
        dialogo.showModal()
      }
      if (!codigoInicial) {
        inputRef.current?.focus()
      }
    } else if (dialogo.open) {
      dialogo.close()
    }
  }, [abierto, codigoInicial])

  function manejarClickDialogo(evento) {
    const dialogo = dialogRef.current
    if (!dialogo || 'closedBy' in HTMLDialogElement.prototype) return
    if (evento.target !== dialogo) return

    const rect = dialogo.getBoundingClientRect()
    const dentroDelContenido =
      rect.top <= evento.clientY &&
      evento.clientY <= rect.top + rect.height &&
      rect.left <= evento.clientX &&
      evento.clientX <= rect.left + rect.width

    if (!dentroDelContenido) {
      dialogo.close()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      onClick={manejarClickDialogo}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-2xl border border-mazorca/40 bg-crema p-0 text-cacao shadow-2xl backdrop:bg-cacao/70 backdrop:backdrop-blur-xs"
    >
      {abierto && (
        <ContenidoModalFicha
          key={codigoInicial}
          idBase={idBase}
          idTitulo={idTitulo}
          inputRef={inputRef}
          codigoInicial={codigoInicial}
          onCerrarDialogo={() => dialogRef.current?.close()}
        />
      )}
    </dialog>
  )
}

function ContenidoModalFicha({ idBase, idTitulo, inputRef, codigoInicial, onCerrarDialogo }) {
  const idCampo = `${idBase}-codigo`
  const idError = `${idBase}-error`
  const inicialLimpio = codigoInicial ? codigoInicial.trim().toUpperCase() : ''

  const [codigoInput, setCodigoInput] = useState(inicialLimpio)
  const [codigoConsultado, setCodigoConsultado] = useState(inicialLimpio)
  const [errorValidacion, setErrorValidacion] = useState(null)

  function manejarEnvio(evento) {
    evento.preventDefault()
    const limpio = codigoInput.trim().toUpperCase()
    if (!limpio) {
      setErrorValidacion('Escriba el código impreso en la etiqueta, por ejemplo CAC001-T1.')
      return
    }
    setErrorValidacion(null)
    setCodigoInput(limpio)
    setCodigoConsultado(limpio)
  }

  function seleccionarCodigo(codigo) {
    setErrorValidacion(null)
    setCodigoInput(codigo)
    setCodigoConsultado(codigo)
  }

  return (
    <div className="flex max-h-[88dvh] flex-col">
      {/* Encabezado del modal */}
      <header className="flex items-center justify-between gap-3 border-b border-mazorca/25 bg-cacao px-5 py-3.5 text-crema">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-mazorca/45 bg-crema p-1 shadow-xs">
            <img
              src="/assets/logo-emblema-192.webp"
              alt="Asoprocacao"
              width={32}
              height={32}
              className="h-7 w-auto object-contain"
            />
          </div>
          <div>
            <h2 id={idTitulo} className="font-display text-xl font-bold leading-tight text-crema">
              Consulte el origen de su cacao
            </h2>
            <p className="text-xs text-crema/80">Pasaporte digital del producto · Comprador</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCerrarDialogo}
          aria-label="Cerrar ventana de consulta"
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-crema/25 bg-crema/10 text-crema transition-colors hover:border-mazorca hover:bg-crema/20 ${FOCO}`}
        >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M5 5l10 10M15 5 5 15" />
            </svg>
          </button>
        </header>

        {/* Cuerpo desplazable */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="space-y-3 rounded-xl border border-cacao/15 bg-arena/55 p-4">
            <p className="text-xs leading-relaxed text-cacao/85">
              Ingrese el código de su producto para conocer su procedencia, variedad y recorrido de
              transformación sin salir de esta pantalla.
            </p>

            <form onSubmit={manejarEnvio} noValidate className="space-y-2">
              <label htmlFor={idCampo} className="block text-sm font-semibold text-cacao">
                Código del producto
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  ref={inputRef}
                  id={idCampo}
                  name="codigo"
                  type="text"
                  placeholder="Ej. CAC001 o CAC001-T1"
                  value={codigoInput}
                  onChange={(e) => {
                    setCodigoInput(e.target.value)
                    if (errorValidacion) setErrorValidacion(null)
                  }}
                  aria-invalid={errorValidacion ? true : undefined}
                  aria-describedby={errorValidacion ? idError : undefined}
                  className={`block w-full rounded-md border border-cacao/30 bg-white px-3 py-2 text-sm text-cacao shadow-inner transition-colors ${FOCO} aria-invalid:border-red-700`}
                />
                <button
                  type="submit"
                  className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema shadow-xs transition-colors hover:bg-cacao/90 sm:shrink-0 ${FOCO}`}
                >
                  Ver ficha
                </button>
              </div>
              {errorValidacion && (
                <p id={idError} role="alert" className="text-xs font-medium text-red-800">
                  {errorValidacion}
                </p>
              )}
            </form>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-cacao/70">Ejemplos rápidos:</span>
              {CODIGOS_EJEMPLO.map((ej) => (
                <button
                  key={ej}
                  type="button"
                  onClick={() => seleccionarCodigo(ej)}
                  className={`rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors ${
                    codigoConsultado === ej
                      ? 'border-cacao bg-cacao text-crema'
                      : 'border-cacao/25 bg-crema text-cacao hover:border-mazorca hover:bg-white'
                  } ${FOCO}`}
                >
                  {ej}
                </button>
              ))}
            </div>
          </div>

          {codigoConsultado && (
            <DetalleFichaPublica key={codigoConsultado} codigoLote={codigoConsultado} />
          )}
        </div>

        {/* Pie del modal */}
        <footer className="flex items-center justify-between gap-3 border-t border-cacao/15 bg-arena/45 px-5 py-3">
          <p className="text-[11px] text-cacao/75">
            Información pública del lote · Asoprocacao, Campoalegre (Huila)
          </p>
          <button
            type="button"
            onClick={onCerrarDialogo}
            className={`rounded-md border border-cacao/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-cacao transition-colors hover:bg-crema ${FOCO}`}
          >
            Cerrar
          </button>
        </footer>
      </div>
  )
}
