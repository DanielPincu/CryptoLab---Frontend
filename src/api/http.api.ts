const BASE_URL = import.meta.env.VITE_API_URL
const AUTH_TOKEN_KEY = 'cryptolab:authToken'

export function getAuthToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
}

export async function http(path: string, options: RequestInit = {}) {
  const token = getAuthToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error || 'Request failed')
  }

  return data
}

export const get = (path: string) =>
  http(path)

export const post = (path: string, body: unknown) =>
  http(path, {
    method: 'POST',
    body: JSON.stringify(body)
  })

export const patch = (path: string, body: unknown) =>
  http(path, {
    method: 'PATCH',
    body: JSON.stringify(body)
  })

export const del = (path: string) =>
  http(path, {
    method: 'DELETE'
  })
