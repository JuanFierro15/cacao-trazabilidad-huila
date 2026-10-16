export function urlFichaPublica(codigo) {
  const envUrl = (import.meta.env.VITE_PUBLIC_BASE_URL || '').trim()
  const base = envUrl
    ? envUrl.replace(/\/+$/, '')
    : typeof window !== 'undefined'
      ? window.location.origin
      : ''
  return `${base}/ficha/${encodeURIComponent(codigo)}`
}

export function usaUrlLocal() {
  const envUrl = (import.meta.env.VITE_PUBLIC_BASE_URL || '').trim()
  if (envUrl) return false
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}
