
// src/services/auth.ts
import publicApi from './publicApi'
import { Amigo }    from '../types/AmigoTypes'

let csrfToken: string | null = null

async function ensureCsrf(): Promise<string> {
  if (csrfToken) return csrfToken

  // 1) hit the Rails endpoint that emits the CSRF cookie *and* returns the token in its header
  const resp = await publicApi.get('/api/v1/csrf')
  const token = resp.headers['x-csrf-token']
  if (!token) throw new Error('Failed to obtain CSRF token from server')

  // 2) cache it, and install it as a default header on publicApi
  csrfToken = token
  publicApi.defaults.headers.common['X-CSRF-Token'] = token

  return token
}

export interface LoginParams {
  login_attribute: string
  password:        string
}

export async function loginAmigo(params: LoginParams): Promise<Amigo> {
  // make sure we have a fresh CSRF token & header in place
  await ensureCsrf()

  // now axios will send the `X-CSRF-Token` header automatically
  const resp = await publicApi.post<{
    data: { amigo: Amigo; jwt_expires_at: string }
  }>('/api/v1/login', { amigo: params })

  return resp.data.data.amigo
}


export async function signupAmigo(payload: any) {
  await ensureCsrf()
  const resp = await publicApi.post('/api/v1/signup', payload)
  return resp.data
}

export async function logoutAmigo() {
  await ensureCsrf()
  const resp = await publicApi.delete('/api/v1/logout')
  return resp.data
}

export async function verifyToken() {
  await ensureCsrf()
  const resp = await publicApi.get<{ valid: boolean }>('/api/v1/verify_token')
  return resp.data
}

export async function refreshToken() {
  await ensureCsrf()
  const resp = await publicApi.post('/api/v1/refresh_token')
  return resp.data
}
