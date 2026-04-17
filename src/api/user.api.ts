import { get, patch } from './http.api'
import type { IUser } from '../interfaces/user.interface'

export async function apiUserMe(): Promise<IUser> {
  const data = await get('/user/me')
  return data?.user ?? data
}

export async function apiUserUpdateMe(payload: {
  username?: string
  email?: string
}): Promise<IUser> {
  const data = await patch('/user/me', payload)
  return data?.user ?? data
}

export async function apiUserById(id: string): Promise<IUser> {
  const data = await get(`/user/${id}`)
  return data?.user ?? data
}