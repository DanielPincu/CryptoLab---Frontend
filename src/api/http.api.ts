const BASE_URL = import.meta.env.VITE_API_URL

export async function http(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
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