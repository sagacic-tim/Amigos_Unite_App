// src/hooks/useAuth.tsx
import { useState, useEffect, useCallback } from 'react'
import publicApi from '../services/publicApi'
import privateApi from '../services/privateApi'
import { Amigo } from '../types/AmigoTypes'

/**
 * A hook to drive your auth flow:
 * - fetch CSRF token with publicApi
 * - verify or refresh JWT with publicApi
 * - then load protected data (amigos) with privateApi
 */
const useAuth = (requireAuth = true) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading,   setLoading]   = useState(requireAuth)
  const [amigos,    setAmigos]    = useState<Amigo[]>([])
  const [error,     setError]     = useState<string | null>(null)

  // 1) try verify_token → returns { valid: boolean }
  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await publicApi.get<{ valid: boolean }>('/api/v1/verify_token')
      return res.data.valid
    } catch {
      return false
    }
  }, [])

  // 2) if verify failed, post refresh_token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      await publicApi.post('/api/v1/refresh_token')
      return true
    } catch {
      return false
    }
  }, [])

  // 3) after we know we're authenticated, load the protected Amigos list
  const loadAmigos = useCallback(async () => {
    try {
      const res = await privateApi.get<{ amigos: Amigo[] }>('/api/v1/amigos')
      setAmigos(res.data.amigos)
    } catch {
      setError('Error fetching amigos.')
    }
  }, [])

  useEffect(() => {
    // bail out immediately if this page doesn’t require auth
    if (!requireAuth) {
      setLoading(false)
      return
    }

    const init = async () => {
      setLoading(true)

      // always grab a fresh CSRF‑TOKEN cookie on entry
      await publicApi.get('/api/v1/csrf').catch(console.error)

      // verify, then refresh if needed
      let ok = await verifyToken()
      if (!ok) ok = await refreshToken()

      setIsLoggedIn(ok)
      if (ok) {
        await loadAmigos()
      }

      setLoading(false)
    }

    init()
  }, [requireAuth, verifyToken, refreshToken, loadAmigos])

  return { isLoggedIn, loading, amigos, error }
}

export default useAuth
