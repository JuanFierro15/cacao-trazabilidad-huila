import { useState } from 'react'
import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import { evaluarHumedad } from '../utilidades/calidadCacao.js'
import { formatearFechaHora, formatearPorcentaje } from '../utilidades/formato.js'
import { urlFichaPublica } from '../utilidades/urlFicha.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

export function BotonImprimirCertificado({ className = '' }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`rounded-md border border-cacao/30 bg-white px-3 py-2 text-sm font-semibold text-cacao hover:bg-cacao/5 print:hidden ${FOCO} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1.5 inline-block size-4"
      >
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Imprimir etiqueta / Certificado QR
    </button>
  )
}

function textoEstadoCertificado(estado) {
  if (estado === 'LIBERADO') return 'Disponible para la venta'
  if (estado === 'PENDIENTE') return 'En verificación'
  if (estado === 'BLOQUEADO') return 'Retenido: no disponible para la venta'
  return estado || '—'
}

export function CertificadoImprimible({
  codigoLote,
  producto,
  estado,
  finca,
  municipio,
  variedad,
  humedad,
  tipoGrano = 'SECO',
}) {
  const [fechaEmision] = useState(() => formatearFechaHora(new Date().toISOString()))

  if (typeof document === 'undefined') return null

  const url = urlFichaPublica(codigoLote)

  const tieneHumedad = humedad !== undefined && humedad !== null
  const esNumeroHumedad = typeof humedad === 'number' && Number.isFinite(humedad)
  const evaluacion = esNumeroHumedad && tipoGrano === 'SECO' ? evaluarHumedad(humedad, 'SECO') : null

  let veredictoHumedad = null
  if (evaluacion) {
    if (evaluacion.nivel === 'cumple') {
      veredictoHumedad = 'Cumple referencia'
    } else if (evaluacion.nivel === 'exceso') {
      veredictoHumedad = 'Exceso de humedad'
    } else {
      veredictoHumedad = 'Baja humedad'
    }
  }

  return createPortal(
    <div className="certificado-impresion hidden">
      <div className="certificado-marco">
        {/* Encabezado con emblema y títulos */}
        <div className="text-center space-y-1">
          <img
            src="/assets/logo-emblema-384.webp"
            alt="Asoprocacao"
            width={72}
            height={72}
            className="mx-auto h-16 w-auto object-contain"
          />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-cacao">
            Certificado de origen · Cacao con historia
          </h1>
          <p className="text-xs font-medium text-cacao/70">
            Asoprocacao · Campoalegre, Huila
          </p>
        </div>

        {/* Identificación del lote y producto */}
        <div className="my-4 text-center border-y border-mazorca/40 py-3 bg-arena/20">
          <p className="text-xs font-semibold text-cacao/70 uppercase tracking-widest">
            Código de lote
          </p>
          <p className="font-display text-4xl font-bold tracking-tight text-cacao">
            {codigoLote}
          </p>
          {producto && (
            <p className="mt-1 text-sm font-semibold text-cacao">
              {producto}
            </p>
          )}
        </div>

        {/* Tabla de datos de origen y calidad (lista blanca estricta) */}
        <table className="w-full text-left text-sm border-collapse my-3">
          <caption className="sr-only">Datos del certificado de origen</caption>
          <tbody className="divide-y divide-cacao/10">
            <tr>
              <th scope="row" className="py-2 pr-4 text-xs font-semibold text-cacao/70 w-1/3">
                Finca
              </th>
              <td className="py-2 font-medium text-cacao">
                {finca || '—'}
              </td>
            </tr>
            <tr>
              <th scope="row" className="py-2 pr-4 text-xs font-semibold text-cacao/70">
                Municipio
              </th>
              <td className="py-2 font-medium text-cacao">
                {municipio || '—'}
              </td>
            </tr>
            <tr>
              <th scope="row" className="py-2 pr-4 text-xs font-semibold text-cacao/70">
                Departamento
              </th>
              <td className="py-2 font-medium text-cacao">
                Huila
              </td>
            </tr>
            <tr>
              <th scope="row" className="py-2 pr-4 text-xs font-semibold text-cacao/70">
                Variedad de cacao
              </th>
              <td className="py-2 font-medium text-cacao">
                {variedad || '—'}
              </td>
            </tr>
            <tr>
              <th scope="row" className="py-2 pr-4 text-xs font-semibold text-cacao/70">
                Estado del lote
              </th>
              <td className="py-2 font-semibold text-cacao">
                {textoEstadoCertificado(estado)}
              </td>
            </tr>
            {tieneHumedad && (
              <tr>
                <th scope="row" className="py-2 pr-4 text-xs font-semibold text-cacao/70">
                  Humedad
                </th>
                <td className="py-2 text-cacao">
                  <div className="font-medium tabular-nums">
                    {esNumeroHumedad ? formatearPorcentaje(humedad) : '—'}
                    {veredictoHumedad && ` · ${veredictoHumedad}`}
                  </div>
                  <div className="text-xs text-cacao/70">
                    Referencia NTC 1252: máximo 7,0 %
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Código QR y verificación pública */}
        <div className="mt-4 flex flex-col items-center justify-center text-center space-y-2 border-t border-cacao/15 pt-4">
          <div className="rounded-lg border border-cacao/20 bg-white p-2">
            <QRCodeSVG
              value={url}
              size={200}
              level="M"
              marginSize={2}
            />
          </div>
          <p className="text-xs font-semibold text-cacao">
            Escanee para ver la ficha pública del lote
          </p>
          <p className="font-mono text-[11px] text-cacao/70 break-all select-all max-w-sm">
            {url}
          </p>
        </div>

        {/* Pie con fecha de emisión */}
        <div className="mt-4 border-t border-cacao/10 pt-2 text-center text-xs text-cacao/70">
          Fecha de emisión: {fechaEmision}
        </div>
      </div>
    </div>,
    document.body,
  )
}
