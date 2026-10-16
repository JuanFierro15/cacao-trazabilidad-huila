import { useContext } from 'react'
import { ContextoAuth } from './contextoAuth.js'

export function useAuth() {
  const contexto = useContext(ContextoAuth)
  if (contexto === null) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  }
  return contexto
}
