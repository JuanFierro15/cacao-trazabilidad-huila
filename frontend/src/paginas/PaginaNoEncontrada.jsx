import { Link } from 'react-router'

export function PaginaNoEncontrada() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-crema px-4 text-center text-cacao">
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p className="text-cacao/80">La dirección que abrió no existe. Revise el enlace o vuelva al inicio.</p>
      <Link
        to="/"
        className="rounded-md bg-cacao px-4 py-2 font-semibold text-crema hover:bg-cacao/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mazorca"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
