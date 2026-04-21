import { get, post } from './http.api'
import type { ILoginPayload, IRegisterPayload } from '../interfaces/auth.interface'

export async function apiLogin(payload: ILoginPayload) {
  return await post('/user/login', payload)
}

export async function apiRegister(payload: IRegisterPayload) {
  return await post('/user/register', payload)
}

export async function apiMe() {
  return await get('/user/me')
}

export async function apiLogout() {
  return await post('/user/logout', {})
}