

import { http } from './http.api'
import type { IUser } from '../interfaces/user.interface'

export async function apiUserMe(): Promise<IUser> {
  const res = await http.get('/user/me')
  return res.data?.user ?? res.data
}

export async function apiUserUpdateMe(payload: {
  username?: string
  email?: string
}): Promise<IUser> {
  const res = await http.patch('/user/me', payload)
  return res.data?.user ?? res.data
}

export async function apiUserById(id: string): Promise<IUser> {
  const res = await http.get(`/user/${id}`)
  return res.data?.user ?? res.data
}