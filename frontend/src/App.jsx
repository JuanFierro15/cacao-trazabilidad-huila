import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext.jsx'
import { RutaProtegida } from './auth/RutaProtegida.jsx'
import { ROLES, rutaInicioPorRol } from './auth/roles.js'
import { useAuth } from './auth/useAuth.js'
import { MarcoAplicacion } from './componentes/MarcoAplicacion.jsx'
import { PaginaNoEncontrada } from './paginas/PaginaNoEncontrada.jsx'
import { PanelAdministrador } from './paginas/admin/PanelAdministrador.jsx'
import { PaginaLogin } from './paginas/login/PaginaLogin.jsx'
import { PaginaDetalleLote } from './paginas/lotes/PaginaDetalleLote.jsx'
import { PaginaRecepcion } from './paginas/operador/PaginaRecepcion.jsx'
import { PanelOperador } from './paginas/operador/PanelOperador.jsx'

function Inicio() {
  const { autenticado, rol } = useAuth()
  return <Navigate to={autenticado ? rutaInicioPorRol(rol) : '/login'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<PaginaLogin />} />

          <Route element={<RutaProtegida roles={[ROLES.OPERADOR, ROLES.ADMINISTRADOR]} />}>
            <Route element={<MarcoAplicacion />}>
              <Route path="/operador" element={<PanelOperador />} />
              <Route path="/operador/recepcion" element={<PaginaRecepcion />} />
              <Route path="/lotes/:codigo/trazabilidad" element={<PaginaDetalleLote />} />
            </Route>
          </Route>

          <Route element={<RutaProtegida roles={[ROLES.ADMINISTRADOR]} />}>
            <Route element={<MarcoAplicacion />}>
              <Route path="/admin" element={<PanelAdministrador />} />
            </Route>
          </Route>

          <Route path="*" element={<PaginaNoEncontrada />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
