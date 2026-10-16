import { Link, useParams } from 'react-router'
import { DetalleFichaPublica } from '../../componentes/ModalFichaComprador.jsx'
import {
  EncabezadoPublico,
  FormularioConsultaFicha,
  PiePublico,
} from './PaginaConsultaFicha.jsx'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca'

// Cada código monta su propia ficha cuando se accede por enlace directo o código QR.
export function PaginaFichaPublica() {
  const { codigoLote } = useParams()
  return (
    <div className="flex min-h-screen flex-col bg-crema text-cacao">
      <EncabezadoPublico />
      <main className="mx-auto w-full max-w-xl flex-1 space-y-6 px-4 py-6">
        <DetalleFichaPublica key={codigoLote} codigoLote={codigoLote} conImpresion={true} />
        <div className="rounded-xl border border-cacao/15 bg-white p-5 shadow-xs space-y-3">
          <p className="text-xs font-semibold text-cacao/80">Consultar otro código de lote</p>
          <FormularioConsultaFicha />
        </div>
        <div className="text-center">
          <Link
            to="/"
            className={`text-xs font-semibold text-cacao/80 underline hover:text-cacao ${FOCO}`}
          >
            Ir a la página principal
          </Link>
        </div>
      </main>
      <PiePublico />
    </div>
  )
}
