import { http } from './http.api'
import type { IAccount } from '../interfaces/account.interface'

export async function apiAccountMe(): Promise<IAccount> {
  const res = await http.get('/account/me')
  return res.data
}

export async function apiAccountUpdate(
  payload: Partial<IAccount>
): Promise<IAccount> {
  const res = await http.patch('/account/me', payload)
  return res.data
}

// Add symbol to favorites
export async function apiAccountAddFavorite(symbol: string): Promise<IAccount> {
  const res = await http.patch('/account/me/favorites', { symbol })
  return res.data
}

// Remove symbol from favorites
export async function apiAccountRemoveFavorite(symbol: string): Promise<IAccount> {
  const res = await http.delete('/account/me/favorites', {
    data: { symbol }
  })
  return res.data
}

