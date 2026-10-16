import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ErrorApi } from '../../api/cliente.js'
import {
  obtenerLote,
  obtenerLotes,
  obtenerReglas,
  registrarTransformacion,
} from '../../api/servicios.js'
import { ChipsIncidencia } from '../../componentes/ChipsIncidencia.jsx'
import { InsigniaEstado } from '../../componentes/InsigniaEstado.jsx'
import { ListaAlertas } from '../../componentes/ListaAlertas.jsx'
import { MensajeError } from '../../componentes/MensajeError.jsx'
import { SemaforoMerma } from '../../componentes/SemaforoMerma.jsx'
import {
  fechaHoyBogota,
  formatearCop,
  formatearFecha,
  formatearKg,
  leerDecimal,
  leerMonto,
} from '../../utilidades/formato.js'
import {
  calcularMerma,
  calcularRendimiento,
  nivelMerma,
} from '../../utilidades/merma.js'
import { useConsultaApi } from '../../utilidades/useConsultaApi.js'
import { generarUuid } from '../../utilidades/uuid.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

// Sugerencias editables para el operador según la etapa elegida; no son datos de negocio.
const PRODUCTO_SUGERIDO = {
  BENEFICIO_FERMENTACION_SECADO: 'Cacao seco fermentado',
  LIMPIEZA_CLASIFICACION: 'Grano seco seleccionado',
  TOSTADO_ROASTING: 'Grano tostado',
  DESCASCARILLADO_WINNOWING: 'Nibs de cacao',
  MOLIENDA_LICOR_CACAO: 'Licor de cacao',
  CONTROL_CALIDAD_EMPAQUE: 'Producto empacado',
}

const ORDEN_CAMPOS = [
  'loteOrigenCodigo',
  'etapa',
  'responsable',
  'fechaTransformacion',
  'cantidadEntrada',
  'cantidadSalida',
  'productoSalida',
  'justificacionIncidencia',
  'insumosAgregados',
  'temperaturaProceso',
  'humedadSalida',
  'costoEtapaCop',
  'precioVentaEstimadoCop',
  'detalleCostosIncluidos',
]

export function PaginaTransformacion() {
  const {
    datos: reglas,
    cargando: cargandoReglas,
    error: errorReglas,
    recargar: recargarReglas,
  } = useConsultaApi(() => obtenerReglas(), [])

  const {
    datos: lotes,
    cargando: cargandoLotes,
    error: errorLotes,
    recargar: recargarLotes,
  } = useConsultaApi(() => obtenerLotes(), [])

  const [operacionUuid, setOperacionUuid] = useState(() => generarUuid())

  const [loteOrigenCodigo, setLoteOrigenCodigo] = useState('')
  const [etapa, setEtapa] = useState('')
  const [responsable, setResponsable] = useState('')
  const [fechaTransformacion, setFechaTransformacion] = useState(() => fechaHoyBogota())
  const [cantidadEntrada, setCantidadEntrada] = useState('')
  const [cantidadSalida, setCantidadSalida] = useState('')
  const [productoSalida, setProductoSalida] = useState('')
  const [justificacionIncidencia, setJustificacionIncidencia] = useState('')
  const [insumosAgregados, setInsumosAgregados] = useState('')
  const [mostrarInsumos, setMostrarInsumos] = useState(false)

  const [temperaturaProceso, setTemperaturaProceso] = useState('')
  const [humedadSalida, setHumedadSalida] = useState('')
  const [seccionProcesoAbierta, setSeccionProcesoAbierta] = useState(false)

  const [costoEtapaCop, setCostoEtapaCop] = useState('')
  const [precioVentaEstimadoCop, setPrecioVentaEstimadoCop] = useState('')
  const [detalleCostosIncluidos, setDetalleCostosIncluidos] = useState('')
  const [seccionCostosAbierta, setSeccionCostosAbierta] = useState(false)

  const [erroresPorCampo, setErroresPorCampo] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [avisoDuplicado, setAvisoDuplicado] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const [resultado, setResultado] = useState(null)
  const [reenviando, setReenviando] = useState(false)
  const [resultadoReenvio, setResultadoReenvio] = useState(null)

  const loteOrigenRef = useRef(null)
  const etapaRef = useRef(null)
  const responsableRef = useRef(null)
  const fechaRef = useRef(null)
  const cantidadEntradaRef = useRef(null)
  const cantidadSalidaRef = useRef(null)
  const productoSalidaRef = useRef(null)
  const justificacionRef = useRef(null)
  const insumosAgregadosRef = useRef(null)
  const temperaturaRef = useRef(null)
  const humedadRef = useRef(null)
  const costoRef = useRef(null)
  const precioRef = useRef(null)
  const detalleCostosRef = useRef(null)
  const tituloConfirmacionRef = useRef(null)

  const mapaRefs = {
    loteOrigenCodigo: loteOrigenRef,
    etapa: etapaRef,
    responsable: responsableRef,
    fechaTransformacion: fechaRef,
    cantidadEntrada: cantidadEntradaRef,
    cantidadSalida: cantidadSalidaRef,
    productoSalida: productoSalidaRef,
    justificacionIncidencia: justificacionRef,
    insumosAgregados: insumosAgregadosRef,
    temperaturaProceso: temperaturaRef,
    humedadSalida: humedadRef,
    costoEtapaCop: costoRef,
    precioVentaEstimadoCop: precioRef,
    detalleCostosIncluidos: detalleCostosRef,
  }

  useEffect(() => {
    if (resultado && tituloConfirmacionRef.current) {
      tituloConfirmacionRef.current.focus()
    }
  }, [resultado])

  // Se enfoca en el siguiente ciclo: si el campo está en una sección plegable que se
  // acaba de abrir, todavía no se puede enfocar en este mismo render.
  const enfocarPrimerError = (errores) => {
    setTimeout(() => {
      const campo = ORDEN_CAMPOS.find((c) => errores[c] && mapaRefs[c]?.current)
      if (campo) mapaRefs[campo].current.focus()
    }, 0)
  }

  const limpiarErrorCampo = (campo) => {
    setErroresPorCampo((prev) => {
      if (!prev[campo]) return prev
      const copia = { ...prev }
      delete copia[campo]
      return copia
    })
    if (avisoDuplicado) setAvisoDuplicado(null)
  }

  const lotesDisponibles = Array.isArray(lotes)
    ? lotes.filter((l) => l.cantidadDisponible > 0 && l.estado !== 'BLOQUEADO')
    : []

  const loteSeleccionado = Array.isArray(lotes)
    ? lotes.find((l) => l.codigoLote === loteOrigenCodigo)
    : null

  // Cálculos en vivo únicamente para la vista previa; el valor oficial lo calcula la API.
  const eNum = leerDecimal(cantidadEntrada)
  const sNum = leerDecimal(cantidadSalida)
  const entradaValida = typeof eNum === 'number' && Number.isFinite(eNum) && eNum > 0
  const salidaValida = typeof sNum === 'number' && Number.isFinite(sNum) && sNum >= 0
  const mermaPreview = entradaValida && salidaValida ? calcularMerma(eNum, sNum) : null
  const rendimientoPreview =
    entradaValida && salidaValida ? calcularRendimiento(eNum, sNum) : null
  const nivelPreview =
    mermaPreview !== null ? nivelMerma(mermaPreview, reglas?.umbralMermaPorcentaje) : null

  const chipInsumosActivo = justificacionIncidencia
    .split(/\.\s*/)
    .map((p) => p.trim())
    .includes('Adición de insumos')
  const salidaMayorQueEntrada = entradaValida && salidaValida && sNum > eNum
  const visibleInsumos =
    mostrarInsumos || chipInsumosActivo || salidaMayorQueEntrada || Boolean(insumosAgregados.trim())

  const costoNumVista = leerMonto(costoEtapaCop)
  const precioNumVista = leerMonto(precioVentaEstimadoCop)

  const manejarCambioEtapa = (nuevoCodigo) => {
    setEtapa(nuevoCodigo)
    limpiarErrorCampo('etapa')
    if (!productoSalida.trim() && PRODUCTO_SUGERIDO[nuevoCodigo]) {
      setProductoSalida(PRODUCTO_SUGERIDO[nuevoCodigo])
      limpiarErrorCampo('productoSalida')
    }
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setErrorGeneral(null)
    setAvisoDuplicado(null)

    // Revisión local solo de formato: números válidos si se escribieron caracteres
    const entradaNum = leerDecimal(cantidadEntrada)
    const salidaNum = leerDecimal(cantidadSalida)
    const tempNum = leerDecimal(temperaturaProceso)
    const humNum = leerDecimal(humedadSalida)
    const costoNum = leerMonto(costoEtapaCop)
    const precioNum = leerMonto(precioVentaEstimadoCop)

    const erroresLocales = {}

    if (Number.isNaN(entradaNum)) {
      erroresLocales.cantidadEntrada = 'Escriba un número válido (por ejemplo 120,5).'
    }
    if (Number.isNaN(salidaNum)) {
      erroresLocales.cantidadSalida = 'Escriba un número válido (por ejemplo 120,5).'
    }
    if (Number.isNaN(tempNum)) {
      erroresLocales.temperaturaProceso = 'Escriba un número válido (por ejemplo 120,5).'
      setSeccionProcesoAbierta(true)
    }
    if (Number.isNaN(humNum)) {
      erroresLocales.humedadSalida = 'Escriba un número válido (por ejemplo 120,5).'
      setSeccionProcesoAbierta(true)
    }
    if (Number.isNaN(costoNum)) {
      erroresLocales.costoEtapaCop = 'Escriba un valor en pesos válido (por ejemplo 1.600.000).'
      setSeccionCostosAbierta(true)
    }
    if (Number.isNaN(precioNum)) {
      erroresLocales.precioVentaEstimadoCop = 'Escriba un valor en pesos válido (por ejemplo 1.600.000).'
      setSeccionCostosAbierta(true)
    }

    if (Object.keys(erroresLocales).length > 0) {
      setErroresPorCampo(erroresLocales)
      enfocarPrimerError(erroresLocales)
      return
    }

    const cuerpo = {
      operacionUuid,
      loteOrigenCodigo: loteOrigenCodigo || null,
      etapa: etapa || null,
      responsable: responsable.trim() || null,
      fechaTransformacion: fechaTransformacion || null,
      cantidadEntrada: entradaNum,
      cantidadSalida: salidaNum,
      productoSalida: productoSalida.trim() || null,
      justificacionIncidencia: justificacionIncidencia.trim() || null,
      insumosAgregados: insumosAgregados.trim() || null,
      temperaturaProceso: tempNum,
      humedadSalida: humNum,
      costoEtapaCop: costoNum,
      precioVentaEstimadoCop: precioNum,
      detalleCostosIncluidos: detalleCostosIncluidos.trim() || null,
    }

    try {
      setEnviando(true)
      const res = await registrarTransformacion(cuerpo)
      setErroresPorCampo({})
      setErrorGeneral(null)
      setAvisoDuplicado(null)
      setResultado({ respuesta: res, cuerpo })
      setResultadoReenvio(null)
      recargarLotes()
    } catch (err) {
      if (err instanceof ErrorApi) {
        if (err.codigo === 'VALIDACION') {
          const porCampo = {}
          const otros = []
          for (const item of err.errores) {
            if (item.campo && ORDEN_CAMPOS.includes(item.campo)) {
              porCampo[item.campo] = item.mensaje
            } else {
              otros.push(item)
            }
          }
          setErroresPorCampo(porCampo)
          if (porCampo.temperaturaProceso || porCampo.humedadSalida) {
            setSeccionProcesoAbierta(true)
          }
          if (
            porCampo.costoEtapaCop ||
            porCampo.precioVentaEstimadoCop ||
            porCampo.detalleCostosIncluidos
          ) {
            setSeccionCostosAbierta(true)
          }
          if (porCampo.insumosAgregados) {
            setMostrarInsumos(true)
          }
          if (otros.length > 0 || !err.errores?.length) {
            setErrorGeneral({ mensaje: err.mensaje, errores: otros })
          }
          enfocarPrimerError(porCampo)
          return
        }

        if (err.codigo === 'INVENTARIO_INSUFICIENTE') {
          setErroresPorCampo({ cantidadEntrada: err.mensaje })
          setTimeout(() => cantidadEntradaRef.current?.focus(), 0)
          return
        }

        if (err.codigo === 'SALIDA_SIN_JUSTIFICACION') {
          setMostrarInsumos(true)
          setErroresPorCampo({ insumosAgregados: err.mensaje })
          setTimeout(() => insumosAgregadosRef.current?.focus(), 0)
          return
        }

        if (err.codigo === 'LOTE_BLOQUEADO' || err.codigo === 'NO_ENCONTRADO') {
          setErroresPorCampo({ loteOrigenCodigo: err.mensaje })
          recargarLotes()
          setTimeout(() => loteOrigenRef.current?.focus(), 0)
          return
        }

        if (err.codigo === 'OPERACION_DUPLICADA') {
          const transId = err.cuerpo?.transformacionId
          setAvisoDuplicado(
            `Esta operación ya estaba registrada en el sistema (transformación #${transId ?? ''}). No se aplicó de nuevo.`,
          )
          return
        }
      }
      setErrorGeneral(err)
    } finally {
      setEnviando(false)
    }
  }

  const empezarNuevaTransformacion = () => {
    setOperacionUuid(generarUuid())
    setLoteOrigenCodigo('')
    setEtapa('')
    setCantidadEntrada('')
    setCantidadSalida('')
    setProductoSalida('')
    setJustificacionIncidencia('')
    setInsumosAgregados('')
    setMostrarInsumos(false)
    setTemperaturaProceso('')
    setHumedadSalida('')
    setCostoEtapaCop('')
    setPrecioVentaEstimadoCop('')
    setDetalleCostosIncluidos('')
    setErroresPorCampo({})
    setErrorGeneral(null)
    setAvisoDuplicado(null)
    setTimeout(() => loteOrigenRef.current?.focus(), 0)
  }

  const registrarOtraTransformacion = () => {
    setOperacionUuid(generarUuid())
    setLoteOrigenCodigo('')
    setEtapa('')
    // Conserva la fecha y el responsable del registro anterior.
    setCantidadEntrada('')
    setCantidadSalida('')
    setProductoSalida('')
    setJustificacionIncidencia('')
    setInsumosAgregados('')
    setMostrarInsumos(false)
    setTemperaturaProceso('')
    setHumedadSalida('')
    setCostoEtapaCop('')
    setPrecioVentaEstimadoCop('')
    setDetalleCostosIncluidos('')
    setErroresPorCampo({})
    setErrorGeneral(null)
    setAvisoDuplicado(null)
    setResultadoReenvio(null)
    setResultado(null)
    recargarLotes()
    setTimeout(() => loteOrigenRef.current?.focus(), 0)
  }

  const reenviarMismaOperacion = async () => {
    if (!resultado?.cuerpo) return
    try {
      setReenviando(true)
      setResultadoReenvio(null)
      const res = await registrarTransformacion(resultado.cuerpo)
      setResultadoReenvio({
        tipo: 'error_inesperado_201',
        mensaje: `El servidor registró la operación otra vez (transformación #${res.transformacion?.id}). La idempotencia no se cumplió; revise el backend.`,
      })
    } catch (err) {
      if (err instanceof ErrorApi && err.codigo === 'OPERACION_DUPLICADA') {
        try {
          const loteActual = await obtenerLote(resultado.cuerpo.loteOrigenCodigo)
          const invOriginal = resultado.respuesta.inventarioOrigen
          const mismoInventario =
            loteActual.cantidadRecibida === invOriginal.cantidadRecibida &&
            loteActual.cantidadConsumida === invOriginal.cantidadConsumida &&
            loteActual.cantidadDisponible === invOriginal.cantidadDisponible

          setResultadoReenvio({
            tipo: 'idempotencia_confirmada',
            mensajeError: err.mensaje,
            codigoLote: loteActual.codigoLote,
            recibido: loteActual.cantidadRecibida,
            consumido: loteActual.cantidadConsumida,
            disponible: loteActual.cantidadDisponible,
            mismoInventario,
          })
        } catch (errConsulta) {
          setResultadoReenvio({
            tipo: 'error_consulta',
            mensaje: `El reenvío fue rechazado con 409 OPERACION_DUPLICADA, pero falló la consulta del inventario: ${errConsulta.message}`,
          })
        }
      } else {
        setResultadoReenvio({
          tipo: 'error_general',
          error: err,
        })
      }
    } finally {
      setReenviando(false)
    }
  }

  if ((cargandoReglas && !reglas) || (cargandoLotes && !lotes)) {
    return <p role="status">Cargando datos…</p>
  }

  if (errorReglas && !reglas) {
    return (
      <div className="space-y-4">
        <MensajeError error={errorReglas} titulo="No se pudieron cargar las reglas de negocio" />
        <button
          type="button"
          onClick={recargarReglas}
          className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (errorLotes && !lotes) {
    return (
      <div className="space-y-4">
        <MensajeError error={errorLotes} titulo="No se pudieron cargar los lotes" />
        <button
          type="button"
          onClick={recargarLotes}
          className={`rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (resultado) {
    const { transformacion, inventarioOrigen, alertasGeneradas = [] } = resultado.respuesta
    const nombreEtapa =
      reglas?.etapas?.find((e) => e.codigo === transformacion.etapa)?.nombre ??
      transformacion.etapa

    return (
      <div className="space-y-6">
        <div>
          <h1
            ref={tituloConfirmacionRef}
            tabIndex={-1}
            className="text-2xl font-bold focus:outline-none"
          >
            Transformación registrada
          </h1>
          <p className="mt-1 text-cacao/80">
            {transformacion.loteSalidaCodigo
              ? `Se creó el lote ${transformacion.loteSalidaCodigo} con ${formatearKg(
                  transformacion.cantidadSalida,
                )}.`
              : 'La salida fue 0 kg: no se creó lote de salida.'}
          </p>
        </div>

        <SemaforoMerma
          merma={transformacion.porcentajeMerma}
          rendimiento={transformacion.porcentajeRendimiento}
          umbral={reglas?.umbralMermaPorcentaje}
          oficial={true}
          entrada={transformacion.cantidadEntrada}
          salida={transformacion.cantidadSalida}
        />

        <section aria-labelledby="titulo-resumen-transformacion" className="space-y-3">
          <h2 id="titulo-resumen-transformacion" className="text-lg font-semibold">
            Detalle de la transformación
          </h2>
          <dl className="grid grid-cols-1 gap-3 rounded-lg border border-cacao/20 bg-white/50 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-cacao/70">Lote de origen</dt>
              <dd className="mt-0.5 font-medium">{transformacion.loteOrigenCodigo}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-cacao/70">Etapa</dt>
              <dd className="mt-0.5 font-medium">{nombreEtapa}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-cacao/70">Responsable</dt>
              <dd className="mt-0.5 font-medium">{transformacion.responsable}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-cacao/70">Fecha</dt>
              <dd className="mt-0.5 font-medium">
                {formatearFecha(transformacion.fechaTransformacion)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-cacao/70">Entrada</dt>
              <dd className="mt-0.5 font-medium">
                {formatearKg(transformacion.cantidadEntrada)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-cacao/70">Salida</dt>
              <dd className="mt-0.5 font-medium">
                {formatearKg(transformacion.cantidadSalida)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-cacao/70">Justificación</dt>
              <dd className="mt-0.5">{transformacion.justificacionIncidencia || '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-cacao/70">Insumos</dt>
              <dd className="mt-0.5">{transformacion.insumosAgregados || '—'}</dd>
            </div>
          </dl>
        </section>

        {inventarioOrigen && (
          <section aria-labelledby="titulo-inventario-origen" className="space-y-3">
            <h2 id="titulo-inventario-origen" className="text-lg font-semibold">
              Inventario del lote de origen
            </h2>
            <dl className="grid grid-cols-1 gap-3 rounded-lg border border-cacao/20 bg-white/50 p-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold text-cacao/70">Recibido</dt>
                <dd className="mt-0.5 text-base font-semibold">
                  {formatearKg(inventarioOrigen.cantidadRecibida)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-cacao/70">Consumido</dt>
                <dd className="mt-0.5 text-base font-semibold text-mazorca">
                  {formatearKg(inventarioOrigen.cantidadConsumida)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-cacao/70">Disponible</dt>
                <dd className="mt-0.5 text-base font-semibold text-origen">
                  {formatearKg(inventarioOrigen.cantidadDisponible)}
                </dd>
              </div>
            </dl>
          </section>
        )}

        <section aria-labelledby="titulo-alertas-generadas" className="space-y-3">
          <h2 id="titulo-alertas-generadas" className="text-lg font-semibold">
            Alertas generadas
          </h2>
          {alertasGeneradas.length > 0 ? (
            <ListaAlertas alertas={alertasGeneradas} />
          ) : (
            <p className="text-sm text-cacao/80">No se generaron alertas.</p>
          )}
        </section>

        <p className="text-xs text-cacao/70">
          Identificador de la operación:{' '}
          <span className="font-mono">{resultado.cuerpo.operacionUuid}</span>
        </p>

        {resultadoReenvio?.tipo === 'idempotencia_confirmada' && (
          <div
            role="status"
            className="space-y-1.5 rounded-lg border border-origen/60 bg-origen/10 p-4 text-sm text-cacao"
          >
            <p className="font-semibold text-origen">
              El sistema rechazó el reenvío (409 OPERACION_DUPLICADA):{' '}
              <span className="font-normal text-cacao">{resultadoReenvio.mensajeError}</span>
            </p>
            <p>
              Inventario actual de {resultadoReenvio.codigoLote} consultado al servidor: recibido{' '}
              {formatearKg(resultadoReenvio.recibido)}, consumido{' '}
              {formatearKg(resultadoReenvio.consumido)}, disponible{' '}
              {formatearKg(resultadoReenvio.disponible)}.
            </p>
            <p className="font-medium">
              {resultadoReenvio.mismoInventario
                ? 'El inventario no cambió.'
                : 'Atención: el inventario cambió respecto al registro original.'}
            </p>
          </div>
        )}

        {resultadoReenvio?.tipo === 'error_inesperado_201' && (
          <div
            role="alert"
            className="rounded-lg border border-red-700 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-semibold">{resultadoReenvio.mensaje}</p>
          </div>
        )}

        {resultadoReenvio?.tipo === 'error_general' && (
          <MensajeError error={resultadoReenvio.error} titulo="Error al reenviar la operación" />
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={registrarOtraTransformacion}
            className={`min-h-[44px] rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
          >
            Registrar otra transformación
          </button>

          <div className="space-y-1">
            <button
              type="button"
              disabled={reenviando}
              onClick={reenviarMismaOperacion}
              className={`min-h-[44px] rounded-md border border-cacao px-4 py-2 text-sm font-semibold text-cacao hover:bg-cacao/10 disabled:opacity-60 ${FOCO}`}
            >
              {reenviando ? 'Reenviando…' : 'Reenviar la misma operación'}
            </button>
            <p className="text-xs text-cacao/70">
              Envía otra vez exactamente los mismos datos y el mismo identificador para comprobar
              que el sistema no registra la operación dos veces.
            </p>
          </div>

          {transformacion.loteSalidaCodigo && (
            <Link
              to={`/lotes/${transformacion.loteSalidaCodigo}/trazabilidad`}
              className={`inline-flex min-h-[44px] items-center text-sm font-semibold text-mazorca underline hover:text-mazorca/80 ${FOCO}`}
            >
              Ver trazabilidad del lote de salida
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrar transformación</h1>
        <p className="mt-1 text-cacao/80">
          Registre una etapa del proceso: lo que entra, lo que sale y por qué.
        </p>
      </div>

      {avisoDuplicado && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-lg border border-mazorca/50 bg-mazorca/10 p-4 text-sm text-cacao sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{avisoDuplicado}</p>
          <button
            type="button"
            onClick={empezarNuevaTransformacion}
            className={`min-h-[44px] rounded-md bg-cacao px-3 py-1.5 text-xs font-semibold text-crema hover:bg-cacao/90 sm:text-sm ${FOCO}`}
          >
            Empezar una nueva transformación
          </button>
        </div>
      )}

      {errorGeneral && <MensajeError error={errorGeneral} />}

      <form noValidate onSubmit={manejarEnvio} className="space-y-6">
        {/* Lote de origen */}
        <div className="space-y-1.5">
          <label htmlFor="campo-lote-origen" className="block text-sm font-semibold">
            Lote de origen
          </label>
          {lotesDisponibles.length === 0 ? (
            <p className="rounded-md border border-mazorca/40 bg-mazorca/10 p-3 text-sm text-cacao">
              No hay lotes con inventario disponible para transformar.{' '}
              <Link to="/operador/recepcion" className={`font-semibold underline ${FOCO}`}>
                Registrar una recepción de lote
              </Link>
            </p>
          ) : (
            <select
              id="campo-lote-origen"
              ref={loteOrigenRef}
              value={loteOrigenCodigo}
              onChange={(e) => {
                setLoteOrigenCodigo(e.target.value)
                limpiarErrorCampo('loteOrigenCodigo')
              }}
              aria-invalid={Boolean(erroresPorCampo.loteOrigenCodigo)}
              aria-describedby={
                erroresPorCampo.loteOrigenCodigo ? 'error-loteOrigenCodigo' : undefined
              }
              className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
                erroresPorCampo.loteOrigenCodigo ? 'border-red-700' : 'border-cacao/30'
              } ${FOCO}`}
            >
              <option value="">Seleccione un lote…</option>
              {lotesDisponibles.map((l) => (
                <option key={l.codigoLote} value={l.codigoLote}>
                  {l.codigoLote} · {l.producto} · {formatearKg(l.cantidadDisponible)} disponibles
                </option>
              ))}
            </select>
          )}

          {loteSeleccionado && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <span className="text-cacao/80">
                {loteSeleccionado.productor?.nombreFinca
                  ? `${loteSeleccionado.productor.nombreFinca} · ${loteSeleccionado.origenMunicipio}`
                  : loteSeleccionado.origenMunicipio}
              </span>
              <InsigniaEstado estado={loteSeleccionado.estado} />
              <button
                type="button"
                onClick={() => {
                  setCantidadEntrada(
                    String(loteSeleccionado.cantidadDisponible).replace('.', ','),
                  )
                  limpiarErrorCampo('cantidadEntrada')
                }}
                className={`text-xs font-semibold text-mazorca underline hover:text-mazorca/80 ${FOCO}`}
              >
                Usar todo el disponible ({formatearKg(loteSeleccionado.cantidadDisponible)})
              </button>
            </div>
          )}

          {erroresPorCampo.loteOrigenCodigo && (
            <p id="error-loteOrigenCodigo" className="text-xs font-medium text-red-700">
              {erroresPorCampo.loteOrigenCodigo}
            </p>
          )}
        </div>

        {/* Etapa */}
        <div className="space-y-1.5">
          <label htmlFor="campo-etapa" className="block text-sm font-semibold">
            Etapa
          </label>
          <select
            id="campo-etapa"
            ref={etapaRef}
            value={etapa}
            onChange={(e) => manejarCambioEtapa(e.target.value)}
            aria-invalid={Boolean(erroresPorCampo.etapa)}
            aria-describedby={erroresPorCampo.etapa ? 'error-etapa' : undefined}
            className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
              erroresPorCampo.etapa ? 'border-red-700' : 'border-cacao/30'
            } ${FOCO}`}
          >
            <option value="">Seleccione una etapa…</option>
            {reglas?.etapas?.map((e) => (
              <option key={e.codigo} value={e.codigo}>
                {e.nombre}
              </option>
            ))}
          </select>
          {erroresPorCampo.etapa && (
            <p id="error-etapa" className="text-xs font-medium text-red-700">
              {erroresPorCampo.etapa}
            </p>
          )}
        </div>

        {/* Responsable */}
        <div className="space-y-1.5">
          <label htmlFor="campo-responsable" className="block text-sm font-semibold">
            Responsable
          </label>
          <input
            id="campo-responsable"
            ref={responsableRef}
            type="text"
            placeholder="Ej.: Operario de planta 1"
            value={responsable}
            onChange={(e) => {
              setResponsable(e.target.value)
              limpiarErrorCampo('responsable')
            }}
            aria-invalid={Boolean(erroresPorCampo.responsable)}
            aria-describedby={erroresPorCampo.responsable ? 'error-responsable' : undefined}
            className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
              erroresPorCampo.responsable ? 'border-red-700' : 'border-cacao/30'
            } ${FOCO}`}
          />
          {erroresPorCampo.responsable && (
            <p id="error-responsable" className="text-xs font-medium text-red-700">
              {erroresPorCampo.responsable}
            </p>
          )}
        </div>

        {/* Fecha de la transformación */}
        <div className="space-y-1.5">
          <label htmlFor="campo-fecha" className="block text-sm font-semibold">
            Fecha de la transformación
          </label>
          <input
            id="campo-fecha"
            ref={fechaRef}
            type="date"
            value={fechaTransformacion}
            onChange={(e) => {
              setFechaTransformacion(e.target.value)
              limpiarErrorCampo('fechaTransformacion')
            }}
            aria-invalid={Boolean(erroresPorCampo.fechaTransformacion)}
            aria-describedby={
              erroresPorCampo.fechaTransformacion ? 'error-fechaTransformacion' : undefined
            }
            className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
              erroresPorCampo.fechaTransformacion ? 'border-red-700' : 'border-cacao/30'
            } ${FOCO}`}
          />
          {erroresPorCampo.fechaTransformacion && (
            <p id="error-fechaTransformacion" className="text-xs font-medium text-red-700">
              {erroresPorCampo.fechaTransformacion}
            </p>
          )}
        </div>

        {/* Cantidad de entrada y salida */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="campo-entrada" className="block text-sm font-semibold">
              Cantidad de entrada (kg)
            </label>
            <input
              id="campo-entrada"
              ref={cantidadEntradaRef}
              type="text"
              inputMode="decimal"
              placeholder="Ej.: 100"
              value={cantidadEntrada}
              onChange={(e) => {
                setCantidadEntrada(e.target.value)
                limpiarErrorCampo('cantidadEntrada')
              }}
              aria-invalid={Boolean(erroresPorCampo.cantidadEntrada)}
              aria-describedby={
                erroresPorCampo.cantidadEntrada ? 'error-cantidadEntrada' : undefined
              }
              className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
                erroresPorCampo.cantidadEntrada ? 'border-red-700' : 'border-cacao/30'
              } ${FOCO}`}
            />
            {erroresPorCampo.cantidadEntrada && (
              <p id="error-cantidadEntrada" className="text-xs font-medium text-red-700">
                {erroresPorCampo.cantidadEntrada}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="campo-salida" className="block text-sm font-semibold">
              Cantidad de salida (kg)
            </label>
            <input
              id="campo-salida"
              ref={cantidadSalidaRef}
              type="text"
              inputMode="decimal"
              placeholder="Ej.: 80"
              value={cantidadSalida}
              onChange={(e) => {
                setCantidadSalida(e.target.value)
                limpiarErrorCampo('cantidadSalida')
              }}
              aria-invalid={Boolean(erroresPorCampo.cantidadSalida)}
              aria-describedby={erroresPorCampo.cantidadSalida ? 'error-cantidadSalida' : undefined}
              className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
                erroresPorCampo.cantidadSalida ? 'border-red-700' : 'border-cacao/30'
              } ${FOCO}`}
            />
            {erroresPorCampo.cantidadSalida && (
              <p id="error-cantidadSalida" className="text-xs font-medium text-red-700">
                {erroresPorCampo.cantidadSalida}
              </p>
            )}
          </div>
        </div>

        {/* Semáforo de merma en vivo (vista previa) */}
        <div className="space-y-2">
          <SemaforoMerma
            merma={mermaPreview}
            rendimiento={rendimientoPreview}
            umbral={reglas?.umbralMermaPorcentaje}
            oficial={false}
            entrada={eNum}
            salida={sNum}
          />

          {nivelPreview === 'rojo' && !justificacionIncidencia.trim() && (
            <p
              role="status"
              className="rounded-md border border-mazorca/40 bg-mazorca/10 p-2.5 text-xs text-cacao"
            >
              Sin causa registrada, el sistema también generará una alerta de registro incompleto.
              Use los chips o escriba la causa.
            </p>
          )}

          {salidaMayorQueEntrada && !insumosAgregados.trim() && (
            <p
              role="status"
              className="rounded-md border border-mazorca/40 bg-mazorca/10 p-2.5 text-xs text-cacao"
            >
              La salida supera la entrada: registre los insumos agregados; sin ellos el sistema
              rechazará el registro.
            </p>
          )}
        </div>

        {/* Producto de salida */}
        <div className="space-y-1.5">
          <label htmlFor="campo-producto-salida" className="block text-sm font-semibold">
            Producto de salida
          </label>
          <input
            id="campo-producto-salida"
            ref={productoSalidaRef}
            type="text"
            placeholder="Ej.: Grano seco seleccionado"
            value={productoSalida}
            onChange={(e) => {
              setProductoSalida(e.target.value)
              limpiarErrorCampo('productoSalida')
            }}
            aria-invalid={Boolean(erroresPorCampo.productoSalida)}
            aria-describedby={
              erroresPorCampo.productoSalida ? 'error-productoSalida' : undefined
            }
            className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
              erroresPorCampo.productoSalida ? 'border-red-700' : 'border-cacao/30'
            } ${FOCO}`}
          />
          {erroresPorCampo.productoSalida && (
            <p id="error-productoSalida" className="text-xs font-medium text-red-700">
              {erroresPorCampo.productoSalida}
            </p>
          )}
        </div>

        {/* Justificación de la incidencia con chips */}
        <div className="space-y-2">
          <label htmlFor="campo-justificacion" className="block text-sm font-semibold">
            Justificación de la incidencia
          </label>
          <ChipsIncidencia
            valor={justificacionIncidencia}
            onCambiar={(texto) => {
              setJustificacionIncidencia(texto)
              limpiarErrorCampo('justificacionIncidencia')
            }}
            onInsumos={(activar) => setMostrarInsumos(activar)}
          />
          <textarea
            id="campo-justificacion"
            ref={justificacionRef}
            rows={3}
            placeholder="Explique las incidencias o causas de la merma observadas en el proceso…"
            value={justificacionIncidencia}
            onChange={(e) => {
              setJustificacionIncidencia(e.target.value)
              limpiarErrorCampo('justificacionIncidencia')
            }}
            aria-invalid={Boolean(erroresPorCampo.justificacionIncidencia)}
            aria-describedby={
              erroresPorCampo.justificacionIncidencia ? 'error-justificacionIncidencia' : undefined
            }
            className={`block w-full rounded-md border bg-white p-3 text-base shadow-xs ${
              erroresPorCampo.justificacionIncidencia ? 'border-red-700' : 'border-cacao/30'
            } ${FOCO}`}
          />
          {erroresPorCampo.justificacionIncidencia && (
            <p id="error-justificacionIncidencia" className="text-xs font-medium text-red-700">
              {erroresPorCampo.justificacionIncidencia}
            </p>
          )}
        </div>

        {/* Insumos agregados */}
        {visibleInsumos && (
          <div className="space-y-1.5">
            <label htmlFor="campo-insumos" className="block text-sm font-semibold">
              Insumos agregados
            </label>
            <input
              id="campo-insumos"
              ref={insumosAgregadosRef}
              type="text"
              placeholder="Ej.: Agua, azúcar u otros aditivos de proceso"
              value={insumosAgregados}
              onChange={(e) => {
                setInsumosAgregados(e.target.value)
                limpiarErrorCampo('insumosAgregados')
              }}
              aria-invalid={Boolean(erroresPorCampo.insumosAgregados)}
              aria-describedby={
                erroresPorCampo.insumosAgregados ? 'error-insumosAgregados' : undefined
              }
              className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
                erroresPorCampo.insumosAgregados ? 'border-red-700' : 'border-cacao/30'
              } ${FOCO}`}
            />
            {erroresPorCampo.insumosAgregados && (
              <p id="error-insumosAgregados" className="text-xs font-medium text-red-700">
                {erroresPorCampo.insumosAgregados}
              </p>
            )}
          </div>
        )}

        {/* Sección plegable: Datos del proceso (opcional) */}
        <details
          open={seccionProcesoAbierta}
          onToggle={(e) => setSeccionProcesoAbierta(e.currentTarget.open)}
          className="rounded-lg border border-cacao/20 bg-white/40 p-4 transition-all"
        >
          <summary className={`cursor-pointer text-sm font-semibold text-cacao select-none ${FOCO}`}>
            Datos del proceso (opcional)
          </summary>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="campo-temperatura" className="block text-sm font-medium">
                Temperatura del proceso (°C)
              </label>
              <input
                id="campo-temperatura"
                ref={temperaturaRef}
                type="text"
                inputMode="decimal"
                placeholder="Ej.: 45"
                value={temperaturaProceso}
                onChange={(e) => {
                  setTemperaturaProceso(e.target.value)
                  limpiarErrorCampo('temperaturaProceso')
                }}
                aria-invalid={Boolean(erroresPorCampo.temperaturaProceso)}
                aria-describedby={
                  erroresPorCampo.temperaturaProceso ? 'error-temperaturaProceso' : undefined
                }
                className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
                  erroresPorCampo.temperaturaProceso ? 'border-red-700' : 'border-cacao/30'
                } ${FOCO}`}
              />
              {erroresPorCampo.temperaturaProceso && (
                <p id="error-temperaturaProceso" className="text-xs font-medium text-red-700">
                  {erroresPorCampo.temperaturaProceso}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="campo-humedad-salida" className="block text-sm font-medium">
                Humedad de salida (%)
              </label>
              <input
                id="campo-humedad-salida"
                ref={humedadRef}
                type="text"
                inputMode="decimal"
                placeholder="Ej.: 7,2"
                value={humedadSalida}
                onChange={(e) => {
                  setHumedadSalida(e.target.value)
                  limpiarErrorCampo('humedadSalida')
                }}
                aria-invalid={Boolean(erroresPorCampo.humedadSalida)}
                aria-describedby={
                  erroresPorCampo.humedadSalida ? 'error-humedadSalida' : undefined
                }
                className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
                  erroresPorCampo.humedadSalida ? 'border-red-700' : 'border-cacao/30'
                } ${FOCO}`}
              />
              {erroresPorCampo.humedadSalida && (
                <p id="error-humedadSalida" className="text-xs font-medium text-red-700">
                  {erroresPorCampo.humedadSalida}
                </p>
              )}
            </div>
          </div>
        </details>

        {/* Sección plegable: Costos de la etapa (opcional) */}
        <details
          open={seccionCostosAbierta}
          onToggle={(e) => setSeccionCostosAbierta(e.currentTarget.open)}
          className="rounded-lg border border-cacao/20 bg-white/40 p-4 transition-all"
        >
          <summary className={`cursor-pointer text-sm font-semibold text-cacao select-none ${FOCO}`}>
            Costos de la etapa (opcional)
          </summary>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="campo-costo" className="block text-sm font-medium">
                  Costo total de la etapa (COP)
                </label>
                <input
                  id="campo-costo"
                  ref={costoRef}
                  type="text"
                  placeholder="Ej.: 1.600.000"
                  value={costoEtapaCop}
                  onChange={(e) => {
                    setCostoEtapaCop(e.target.value)
                    limpiarErrorCampo('costoEtapaCop')
                  }}
                  aria-invalid={Boolean(erroresPorCampo.costoEtapaCop)}
                  aria-describedby={
                    erroresPorCampo.costoEtapaCop ? 'error-costoEtapaCop' : undefined
                  }
                  className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
                    erroresPorCampo.costoEtapaCop ? 'border-red-700' : 'border-cacao/30'
                  } ${FOCO}`}
                />
                {costoNumVista !== null &&
                  !Number.isNaN(costoNumVista) &&
                  costoNumVista >= 0 && (
                    <p className="text-xs text-cacao/80">
                      Se registrará como {formatearCop(costoNumVista)}
                    </p>
                  )}
                {erroresPorCampo.costoEtapaCop && (
                  <p id="error-costoEtapaCop" className="text-xs font-medium text-red-700">
                    {erroresPorCampo.costoEtapaCop}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="campo-precio" className="block text-sm font-medium">
                  Precio de venta estimado (COP/kg)
                </label>
                <input
                  id="campo-precio"
                  ref={precioRef}
                  type="text"
                  placeholder="Ej.: 25.000"
                  value={precioVentaEstimadoCop}
                  onChange={(e) => {
                    setPrecioVentaEstimadoCop(e.target.value)
                    limpiarErrorCampo('precioVentaEstimadoCop')
                  }}
                  aria-invalid={Boolean(erroresPorCampo.precioVentaEstimadoCop)}
                  aria-describedby={
                    erroresPorCampo.precioVentaEstimadoCop
                      ? 'error-precioVentaEstimadoCop'
                      : undefined
                  }
                  className={`block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base shadow-xs ${
                    erroresPorCampo.precioVentaEstimadoCop ? 'border-red-700' : 'border-cacao/30'
                  } ${FOCO}`}
                />
                {precioNumVista !== null &&
                  !Number.isNaN(precioNumVista) &&
                  precioNumVista >= 0 && (
                    <p className="text-xs text-cacao/80">
                      Se registrará como {formatearCop(precioNumVista)}
                    </p>
                  )}
                {erroresPorCampo.precioVentaEstimadoCop && (
                  <p id="error-precioVentaEstimadoCop" className="text-xs font-medium text-red-700">
                    {erroresPorCampo.precioVentaEstimadoCop}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="campo-detalle-costos" className="block text-sm font-medium">
                Costos incluidos
              </label>
              <textarea
                id="campo-detalle-costos"
                ref={detalleCostosRef}
                rows={2}
                placeholder="Ej.: Materia prima acopiada, mano de obra de planta y energía"
                value={detalleCostosIncluidos}
                onChange={(e) => {
                  setDetalleCostosIncluidos(e.target.value)
                  limpiarErrorCampo('detalleCostosIncluidos')
                }}
                aria-invalid={Boolean(erroresPorCampo.detalleCostosIncluidos)}
                aria-describedby={
                  erroresPorCampo.detalleCostosIncluidos
                    ? 'error-detalleCostosIncluidos'
                    : undefined
                }
                className={`block w-full rounded-md border bg-white p-3 text-base shadow-xs ${
                  erroresPorCampo.detalleCostosIncluidos ? 'border-red-700' : 'border-cacao/30'
                } ${FOCO}`}
              />
              {erroresPorCampo.detalleCostosIncluidos && (
                <p
                  id="error-detalleCostosIncluidos"
                  className="text-xs font-medium text-red-700"
                >
                  {erroresPorCampo.detalleCostosIncluidos}
                </p>
              )}
            </div>
          </div>
        </details>

        {/* Botón de envío */}
        <div className="space-y-2 pt-2">
          <button
            type="submit"
            disabled={enviando}
            className={`min-h-[44px] w-full rounded-md bg-cacao px-4 py-2.5 text-base font-semibold text-crema hover:bg-cacao/90 disabled:opacity-60 sm:w-auto ${FOCO}`}
          >
            {enviando ? 'Registrando…' : 'Registrar transformación'}
          </button>
          <p className="text-xs text-cacao/70">
            Identificador de la operación: <span className="font-mono">{operacionUuid}</span>. Se
            conserva si reintenta tras un error, para que el sistema no registre dos veces la misma
            operación.
          </p>
        </div>
      </form>
    </div>
  )
}
