import { useCallback, useEffect, useMemo, useState } from 'react'
import { registrarManejadorNoAutenticado } from '../api/cliente.js'
import { iniciarSesion as solicitarInicioSesion } from '../api/servicios.js'
import { ContextoAuth } from './contextoAuth.js'
import { ROLES } from './roles.js'
import { borrarSesion, guardarSesion, leerSesion } from './sesion.js'

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesion())
  // Motivo del último cierre. RutaProtegida lo usa para hacer la única
  // redirección a /login: si aquí también se navegara, las dos navegaciones
  // competirían y se perdería el aviso o el destino.
  const [cierre, setCierre] = useState(null)

  const iniciarSesion = useCallback(async (username, password) => {
    const nuevaSesion = await solicitarInicioSesion(username, password)
    guardarSesion(nuevaSesion)
    setCierre(null)
    setSesion(nuevaSesion)
    return nuevaSesion
  }, [])

  // Con mensaje (sesión vencida) se conserva la página para volver a ella;
  // un cierre voluntario no la conserva, así el siguiente usuario entra a su panel.
  const cerrarSesion = useCallback((mensaje) => {
    borrarSesion()
    setCierre(mensaje ? { mensaje, conservarDestino: true } : { conservarDestino: false })
    setSesion(null)
  }, [])

  const actualizarPerfilSesion = useCallback((cambios) => {
    setSesion((actual) => {
      if (!actual) return actual
      const actualizada = { ...actual, ...cambios }
      guardarSesion(actualizada)
      return actualizada
    })
  }, [])

  useEffect(() => {
    registrarManejadorNoAutenticado(() =>
      cerrarSesion('Su sesión venció o no es válida. Inicie sesión de nuevo.'),
    )
    return () => registrarManejadorNoAutenticado(null)
  }, [cerrarSesion])

  const valor = useMemo(() => {
    const rol = sesion?.rol ?? null
    return {
      sesion,
      autenticado: sesion !== null,
      rol,
      esAdministrador: rol === ROLES.ADMINISTRADOR,
      cierre,
      iniciarSesion,
      cerrarSesion,
      actualizarPerfilSesion,
    }
  }, [sesion, cierre, iniciarSesion, cerrarSesion, actualizarPerfilSesion])

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>
}

