import publicApi from './publicApi'

let cachedCsrfToken: string | null = null

export async function ensureCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken
  const response = await publicApi.get('/api/v1/csrf') // withCredentials already enabled
  const token = response.headers['x-csrf-token']
  if (!token) throw new Error('Missing CSRF token from backend')
  cachedCsrfToken = token
  return token
}
