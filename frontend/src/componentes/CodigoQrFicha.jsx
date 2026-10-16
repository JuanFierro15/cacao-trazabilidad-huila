import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { QRCodeSVG } from 'qrcode.react'
import { urlFichaPublica, usaUrlLocal } from '../utilidades/urlFicha.js'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

export function CodigoQrFicha({ codigoLote }) {
  const [mensajeCopia, setMensajeCopia] = useState(null)
  const textoUrlRef = useRef(null)

  const url = urlFichaPublica(codigoLote)
  const esLocal = usaUrlLocal()

  async function copiarEnlace() {
    let copiado = false
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url)
        copiado = true
        setMensajeCopia('Enlace copiado')
      } catch {
        copiado = false
      }
    }

    if (!copiado) {
      if (textoUrlRef.current) {
        const seleccion = window.getSelection()
        const rango = document.createRange()
        rango.selectNodeContents(textoUrlRef.current)
        if (seleccion) {
          seleccion.removeAllRanges()
          seleccion.addRange(rango)
        }
      }
      setMensajeCopia('Seleccioné el enlace: cópielo con Ctrl+C')
    }
  }

  return (
    <section
      aria-labelledby="titulo-seccion-qr"
      className="space-y-4 rounded-lg border border-cacao/20 bg-white p-6 shadow-xs"
    >
      <h2 id="titulo-seccion-qr" className="text-lg font-semibold text-cacao">
        Ficha pública y código QR
      </h2>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center justify-center rounded-lg border border-cacao/10 bg-white p-3 shadow-xs">
          <QRCodeSVG
            value={url}
            size={176}
            level="M"
            marginSize={2}
            title={`Código QR de la ficha pública del lote ${codigoLote}`}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-xs text-cacao/70">Enlace directo a la ficha pública:</p>
          <p
            ref={textoUrlRef}
            className="select-all break-all rounded-md border border-cacao/15 bg-crema/60 p-2 text-xs font-mono text-cacao"
          >
            {url}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/ficha/${encodeURIComponent(codigoLote)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block rounded-md bg-cacao px-4 py-2 text-sm font-semibold text-crema hover:bg-cacao/90 ${FOCO}`}
            >
              Abrir ficha pública
            </Link>

            <button
              type="button"
              onClick={copiarEnlace}
              className={`rounded-md border border-cacao/30 px-3 py-2 text-sm font-semibold text-cacao hover:bg-cacao/5 ${FOCO}`}
            >
              Copiar enlace
            </button>
          </div>

          {mensajeCopia && (
            <p role="status" className="text-xs font-semibold text-origen">
              {mensajeCopia}
            </p>
          )}

          {esLocal && (
            <p className="rounded-md border border-mazorca/40 bg-mazorca/10 p-3 text-xs text-cacao">
              Este QR apunta a localhost y solo abre en este equipo. Para escanearlo desde un celular de la misma red,
              configure VITE_PUBLIC_BASE_URL con la IP del PC (por ejemplo http://192.168.1.10:5173) y reinicie el
              frontend.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
